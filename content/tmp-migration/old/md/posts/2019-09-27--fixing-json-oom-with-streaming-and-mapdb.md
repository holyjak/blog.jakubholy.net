---
title: "Fixing JSON out-of-memory error with streaming and MapDB"
category: "SW development"
tags: [performance]
---

Once upon time, an API returned 0.5 GB JSON and our server crashed. We cried, we re-implemented it with streaming parser and a disk-backed Map and it worked again - but was slow. We measured and tweaked and finally got to a pretty good time and decent memory and CPU consumption. Come to learn about our journey, streaming JSON parsing, and [MapDB](http://www.mapdb.org/)!

<!--more-->

Originally we used Jackson to parse an array of `Device`s into Java classes. I don't remember how much heap we had, certainly not below 1GB, but it wasn't enough once the data came close to 2 mil devices. The problem wasn't only parsing the data but also holding that much data in memory. We knew that Jackson supports streaming parsing - a perfect fit for an array - and were looking for a data structure that can leverage the disk instead of holding everything in the memory. We found MapDB, which does just that and, conveniently, exposes the familiar `java.util.Map` interface for working with the data.

First some data from our good friend JConsole, collected across multiple test runs:

| #   | Solution                                | Heap     | CPU     | Processing time | Data disk size |
| --- | --------------------------------------- | -------- | ------- | --------------- | -------------- |
| 1.  | All in memory                           | 1.2GB    | 65%     | 20s             | -              |
| 2.  | Streaming, MapDB, Java serialization    | 80-150MB | 30-55%* | ±2 min          | ± 1GB          |
| 3.  | Streaming only (throwing the data out)  | 60MB     | 160%    | few seconds     | -              |
| 4.  | Streaming, MapDB, Jackson serialization | same     | same    | 35-40s          | 650 MB         |

*) The less max heap usage the higher CPU usage

Highlights:

* We needed approximately twice the JSON size of heap to keep all the data in the memory
* Streaming the data into MapDB cut the heap usage considerably, to ±10% (there is a balance of heap usage vs. CPU usage determined by the dynamic activity of the Java garbage collector)
* Streaming + MapDB were 6-times slower; this is exclusively due to writing/reading data to/from disk since  streaming parsing itself used just a few seconds (see #3)
* Serialization is crucial - when we switched over to Jackson's binary serialization we cut the time three times (i.e. still ± twice slower) and disk storage by half
* (Note: We have also tried to batch `.put`s into the MapDB but it had no effect, presumabely because it already does its own batching)

## The code

Here is our wonderful disk-backed map filed by a streaming JSON parser, consisting of the data class `Device`, `StreamingDeviceParser`, and `OnDiskMap`:

```groovy
// build.gradle:
compile "org.mapdb:mapdb:3.0.7"
compile "com.fasterxml.jackson.core:jackson-core:2.9.5"
compile "com.fasterxml.jackson.core:jackson-databind:2.9.5"
```

```groovy
/** Using the whole thing */
Map<String, Device> getAllDevices() {
  def jsonReader = new StringReader(deviceService.getAllDevices())
  def parser = new StreamingDeviceParser()

  // NOTE: .withCloseable is equivallent to Java's try-with-resources
  def map = new OnDiskMap(Device).delete().openForWrite().withCloseable { map ->
    parser.parseDevices(jsonReader, { Device it -> map.put(it.imsi, it) })
    return map
  }
  map.getData()
}

/** The data class */
import com.fasterxml.jackson.annotation.JsonProperty
class Device {
    String imei
    String imsi
    String manufacturer
    String model
    @JsonProperty("os_name") String osName
    @JsonProperty("os_version") String osVersion
    @JsonProperty("registered_date") String registeredDate
    @JsonProperty("updated_date") String updatedDate
    @JsonProperty("device_type") String deviceType
    @JsonProperty("last_usage") String lastUsage
}

/** The parser */
import com.fasterxml.jackson.core.*
import com.fasterxml.jackson.databind.ObjectMapper
class StreamingDeviceParser {

    void parseDevices(Reader json, Closure processDevice) {
        ObjectMapper mapper = new ObjectMapper();
        JsonFactory factory = mapper.getFactory();
        JsonParser parser = factory.createParser(json)

        try {
            assert parser.nextToken() == JsonToken.START_ARRAY
            while( (parser.nextToken()) == JsonToken.START_OBJECT ) {
                processDevice(parser.readValueAs(Device))
            }
            // Optionally: assert token == JsonToken.END_ARRAY
        } finally {
            parser.close()
        }
    }
}

/** The on-disk map */
import com.fasterxml.jackson.databind.ObjectMapper
import org.mapdb.*
import java.util.concurrent.ConcurrentMap
/**
 * Java Map backed by disk storage, for data too large to fit into the memory all at once.
 * Call `open` before accessing it and `close` when done writing.
 */
class OnDiskMap<T> implements Closeable {

    private DB db
    private ConcurrentMap map
    private Serializer valueSer
    private Class<T> valueType

    OnDiskMap(Class<T> valueType) {
        this.valueType = valueType
        valueSer = new JacksonSerializer(valueType)
    }

    /** Delete the data file */
    OnDiskMap delete() {
        if (db && !db.isClosed()) close()
        new File(dbFileName()).delete()
        return this
    }

    OnDiskMap openForWrite() {
        if (db && !db.isClosed()) return this
        db = createDb()
        map = createMap(db)
        return this
    }

    OnDiskMap put(String key, T value) {
        if(db.isClosed()) { throw new IllegalStateException("DB is closed") }
        map.put(key, value)
        return this
    }

    /** Close the map, write any remaining data to the disk. */
    void close() {
        if (db) db.close()
        db = null
        map = null
    }

    /** Read the data. The map does not need to be open and `close` is not necessary. */
    Map<String, T> getData() {
        return createMap(createDb(true))
    }

    private DB createDb(boolean readOnly = false) {
        def maker = DBMaker
                .fileDB(dbFileName())
                .fileMmapEnable()
        if (readOnly) maker = maker.readOnly()
        try {
            return maker.make();
        } catch (DBException.DataCorruption ignored) {
            // We crashed before closing or something; just delete it
            println("INFO: Corrupted old ${dbFileName()}, deleting...")
            delete()
            return maker.make()
        }
    }

    private ConcurrentMap<String, T> createMap(DB db) {
        return db
                .hashMap("map")
                .keySerializer(Serializer.STRING)
                .valueSerializer(valueSer)
                .createOrOpen() as ConcurrentMap<String, T>;
    }

    private String dbFileName() {
        return "${valueType.getSimpleName()}.db".toString()
    }

    private static class JacksonSerializer implements Serializer {

        ObjectMapper mapper = new ObjectMapper();
        Class valueType

        JacksonSerializer(Class valueType) {
            this.valueType = valueType
        }

        void serialize(DataOutput2 out, Object value) throws IOException {
            out.write(mapper.writeValueAsBytes(value))
        }

        Object deserialize(DataInput2 input, int available) throws IOException {
            return mapper.readValue(input, valueType)
        }
    }
}
```
