'use strict';

/***
    Usage: blog2md <BLOGGER/WordPress BACKUP XML> <OUTPUT DIR>

*/
const fs = require('fs');
const os = require('os');
const path = require('path');
const xml2js = require('xml2js');
var moment = require('moment');

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

    fs.readFile(backupXmlFile, function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log(`Error parsing xml file (${backupXmlFile})\n${JSON.stringify(err)}`);
                return 1;
            }
            var posts = result.rss.channel[0].item;
                console.log(`Total Post count: ${posts.length}`);

                // TODO Download, include wp:attachment_url
                // TODO draft
                // TODO What with post_type = attachment | nav_menu_item ?
                // TODO Handle `<!-- wp:embed {"url":"https://gist.github.com/holyjak/f3f995173539be80ce518a579496c2ba","type":"rich","providerNameSlug":"","className":""} -->`
                // TODO Handle [code lang=text]...[/code]
                // TODO pages: <wp:post_parent>0</wp:post_parent>, <wp:menu_order>0</wp:menu_order>

                const postsByType = posts.map((post) => {
                    var postOut = {};

                    postOut.title = post.title[0].replace(/'/g, "''");
                    postOut.published = post["wp:post_date_gmt"][0];
                    postOut.postType = post["wp:post_type"][0]; // post || page || ...
                    postOut.slug = post["link"][0]
                        .replace(/https:\/\/[^/]+\//, "/")
                        .replace("?p=", ""); // for old posts with `?p=123`
                    postOut.status = post["wp:status"][0];
                    postOut.tags = [];
                    postOut.categories = [];
                    var categoriesTags = post.category;
                    if (categoriesTags && categoriesTags.length){
                        categoriesTags.forEach(function (category){
                            ((category['$'].domain === "post_tag") ? postOut.tags : postOut.categories)
                                .push(category['_']);
                        });
                    }

                    postOut.content = post["content:encoded"][0];
                    postOut.excerpt = post["excerpt:encoded"][0];

                    return postOut;
                })
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
                })

        });
    });

}

function writeToFile(filename, content, append=false){

    // var parentDir = filename.replace(/[^/]+\.md/, "");
    // if (parentDir !== "" && !fs.existsSync(parentDir)) {
    //     fs.mkdirSync(parentDir, {recursive: true});
    // }

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
