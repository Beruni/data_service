"use strict";var mongoose=require("mongoose");var es6_promise_1=require("es6-promise");var dataFileSchema=new mongoose.Schema({user_id:String,title:String,fileId:String,tags:{type:[String],index:true},time:{type:Date,default:Date.now}});dataFileSchema.index({tags:1});var model=mongoose.model("DataFile",dataFileSchema);var DataFile=function(){function DataFile(){}DataFile.prototype.save=function(userId,title,tags,fileId){var newRecord=new model({user_id:userId,title:title,fileId:fileId,tags:tags});return new es6_promise_1.Promise(function(resolve,reject){newRecord.save(function(err,file){return resolve(file["_id"])})})};DataFile.prototype.fetch=function(userId,callback){model.find(userId,function(err,files){if(err){console.error(err.message)}callback(files)}).sort([["_id",-1]])};return DataFile}();exports.DataFile=DataFile;
//# sourceMappingURL=./dist/js/src/models/index.js.map