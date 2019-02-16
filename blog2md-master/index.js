'use strict';

/***
    Usage: blog2md <BLOGGER/WordPress BACKUP XML> <OUTPUT DIR>

*/
const fs = require('fs');
const url = require('url');
const os = require('os');
const path = require('path');
const xml2js = require('xml2js');
var moment = require('moment');

const { Readable, Transform } = require("stream");
const multiStream = require("multistream");
const fetch = require("node-fetch");
const pandoc = require("simple-pandoc"); // BEWARE: Requires pandoc to be installed separately
const split2 = require("split2");
const htmlToMarkdown = pandoc(
  "html",
  "gfm", // GitHub Markdown
  "--wrap=preserve", // Don't wrap text as it could insert newlines that change the meaning, e.g. before a `-`
  "--eol=lf"
);

if (process.argv.length !== 4){
    console.log(`Usage: blog2md <BACKUP XML> <OUTPUT DIR>`)
    return 1;
}

var inputFile =  process.argv[2];
var outputDir = process.argv[3];

if (fs.existsSync(outputDir)) {
    console.log(`WARNING: Given output directory "${outputDir}" already exists. Files will be overwritten.`)
}
else {
    fs.mkdirSync(outputDir);
}
wordpressImport(inputFile, outputDir);

function wordpressImport(backupXmlFile, outputDir){
    var parser = new xml2js.Parser();
    const images = new Set();

    fs.readFile(backupXmlFile, function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log(`Error parsing xml file (${backupXmlFile})\n${JSON.stringify(err)}`);
                return 1;
            }
            // wp:base_blog_url
            const baseBlogUrl = result.rss.channel[0]["wp:base_blog_url"][0];
            var posts = result.rss.channel[0].item;
                console.log(`Total Post count: ${posts.length}`);

                // TODO What with post_type = attachment | nav_menu_item ?

                const postsByType = posts.map((post) => {
                    var postOut = {};

                    postOut.title = post.title[0].replace(/'/g, "''");
                    postOut.published = post["wp:post_date_gmt"][0];
                    postOut.postType = post["wp:post_type"][0]; // post || page || ...
                    postOut.slug = post["link"][0]
                        .replace(/https:\/\/[^/]+\//, "/")
                        .replace("?page_id=", "")
                        .replace("?p=", ""); // for old posts with `?p=123`
                    postOut.status = post["wp:status"][0];

                    if (postOut.status === "inherit") {
                      // Posts with status=inherit are there just to
                      // provide an attachement for another post, should not
                      // be displayed
                      return null;
                    }

                    postOut.tags = [];
                    postOut.categories = [];
                    var categoriesTags = post.category;
                    if (categoriesTags && categoriesTags.length){
                        categoriesTags.forEach(function (category){
                            ((category['$'].domain === "post_tag") ? postOut.tags : postOut.categories)
                                .push(category['_']);
                        });
                    }

                    postOut.content = fixWordpressFormatting({ baseBlogUrl, images }, post["content:encoded"][0]);
                    postOut.excerpt = fixWordpressFormatting({ baseBlogUrl, images }, post["excerpt:encoded"][0]);

                    return postOut;
                })
                .filter(v => v !== null)
                .reduce(
                    (acc, p) => {
                        if (!acc[p.postType]) acc[p.postType] = [];
                        acc[p.postType].push(p);
                        return acc;
                    },
                    {});

                Object.keys(postsByType).forEach((postType) => {
                    writeToFile(
                        `${outputDir}/${postType}s.json`,
                        JSON.stringify(postsByType[postType], null, 1),
                        true
                    );
                    if (postType === "page") {
                      writeToMarkdownFiles(`${outputDir}/pages`, postsByType[postType])
                    }
                });

                return downloadImages(`${outputDir}/images`, images);
        });
    });

}

function downloadImages(destDir, urlSet) {
  if (urlSet.size === 0) return Promise.resolve();

  console.log("Images to download: ", urlSet.size);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const ps = [];
  const filesWip = new Set();
  urlSet.forEach(href => {
    const urlObj = url.parse(href);
    const pathname = urlObj.pathname;
    const filename = destDir + pathname;
    if (fs.existsSync(filename)) return;

    // Two URLs that differ in query param will result in the same image,
    // don't download twice in ||
    if (filesWip.has(filename)) {
      return;
    } else {
      filesWip.add(filename);
    }

    const parentPath = pathname.substring(0, pathname.lastIndexOf("/"));
    const parentDir = destDir + parentPath;

    if (parentPath && !fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    console.log(` downloading ${href} -> ${filename}`);
    ps.push(fetch(href).then(res => res.body.pipe(fs.createWriteStream(filename))));
  });

  return Promise.all(ps);
}

const urlPathRE = /\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

function fixWordpressFormatting({ baseBlogUrl, images }, html) {
  if (!html) return html;
  const baseBlogRE = new RegExp(/https?:/.source + baseBlogUrl.replace(/^https?:/, ""), "g");
  const baseBlogImageUrl = baseBlogUrl
    .replace(/^https:/, "")
    .replace(".wordpress.com", ".files.wordpress.com");
  const baseBlogImageRE = new RegExp(/(https?:)?/.source + baseBlogImageUrl);
  const blogImgRE = new RegExp(baseBlogImageRE.source + urlPathRE.source, "g");
  const fixedHtml = html
    .replace(/\r?\n\r?\n/g, "<br><br>") // normally \n ignored in HTML
    .replace(/\[gist ([^\]]+) \/\]/g, "\n\n$1\n\n")
    .replace(/\[((?:source)?code|source)[^\]]*\]/g, "<pre><code>")
    .replace(/\[\/((?:source)?code|source)\]/g, "</code></pre>")
    .replace(/((href|src)\s*=\s*("|'))http:\/\//g, "$1https://")
    // Just drop img captions; it is too much work to try to
    // extract and use its title
    .replace(/\[caption[^\]]*\]/g, "")
    .replace(/\[\/caption\]/g, "")
    // Make intra-blog links relative
    .replace(baseBlogRE, "")
    // Replace with downloaded images
    .replace(blogImgRE, imgUrl => {
      images.add(imgUrl); // store it
      return imgUrl.replace(baseBlogImageRE, "/images");
    });

  return fixedHtml;
}

function writeToMarkdownFiles(outputDir, pages) {
  // writeToMarkdownFiles(`${outputDir}/pages`, postsByType[postType])
  pages.forEach(page => {
    const filename = `${outputDir}/${page.slug.replace(/\/$/, "")}.md`
    var parentDir = filename.replace(/[^/]+\.md/, "");
    if (parentDir !== "" && !fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // For md., replace back br with newline (added in fixWordpressFormatting)
    const content = page.content; // .replace(/(\s*<br>\s*){2,}/g, "\n\n");

    const frontmatter = `---
    title: "${page.title.replace(/"/g, '\\"')}"
    ---

    `.replace(/\n\s+/g, "\n");

    const markdownBodyStream = htmlToMarkdown
      .stream(str2stream(content))
      .pipe(split2())
      .pipe(linesTransformer());

    const markdownStream = multiStream([str2stream(frontmatter), markdownBodyStream]);

    markdownStream.pipe(fs.createWriteStream(filename));
  });
}

function linesTransformer() {
  return new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString("utf8").replace(/\s+$/, ""));
      this.push("\n"); // re-add end-of-line removed by split2()
      callback();
    }
  });
}

function str2stream(string) {
  const contentStream = new Readable();
  contentStream.push(string);
  contentStream.push(null);
  return contentStream;
}

function writeToFile(filename, content, append=false){

    if(append){
        console.log(`DEBUG: going to append to ${filename}`);
        try{
            fs.appendFileSync(filename, content);
            console.log(`Successfully appended to ${filename}`);
        }
        catch(err){
            console.log(`Error while appending to ${filename} - ${JSON.stringify(err)}`);
            console.dir(err);
        }

    }else{
        console.log(`DEBUG: going to write to ${filename}`);
        try{
            fs.writeFileSync(filename, content);
            console.log(`Successfully written to ${filename}`);
        }
        catch(err){
            console.log(`Error while writing to ${filename} - ${JSON.stringify(err)}`);
            console.dir(err);
        }
    }

}
