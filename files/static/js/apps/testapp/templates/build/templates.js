var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["App"] = this["App"] || {};
this["App"]["Templates"] = this["App"]["Templates"] || {};

this["App"]["Templates"]["galleryList"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "<ul>\n	<li>\n		<img src=\"http://farm4.static.flickr.com/3639/3319814586_dd9c1141dd.jpg?v=0\" alt=\"example pic flicker 2\" width=\"500\" height=\"335\" /> <cite><a class=\"image_link\" href=\"/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> By <a href=\"http://www.flickr.com/photos/tanchristianr/\">Don Takz</a></cite>\n	</li>\n	<li>\n		<img src=\"http://l.yimg.com/g/images/home_photo_notsogoodphotography.jpg\" alt=\"example pic flicker 1\" width=\"500\" height=\"335\" /> <cite><a href=\"http://www.flickr.com/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> Par <a href=\"http://www.flickr.com/photos/notsogoodphotography/\">notsogoodphotography</a></cite>\n\n	</li>\n	<li>\n		<img src=\"http://l.yimg.com/g/images/home_photo_junku.jpg\" alt=\"example pic flicker 2\" width=\"500\" height=\"335\" /> <cite><a href=\"http://www.flickr.com/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> By <a href=\"http://www.flickr.com/photos/junku-newcleus/\">junku-newcleus</a></cite>\n	</li>\n	<li>\n		<img src=\"http://l.yimg.com/g/images/home_photo_pmorgan.jpg\" alt=\"example pic flicker 2\" width=\"500\" height=\"335\" /> <cite><a class=\"image_link\" href=\"http://www.flickr.com/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> By <a href=\"http://www.flickr.com/photos/pmorgan/\">pmorgan</a></cite>\n\n	</li>\n</ul>";
  });

this["App"]["Templates"]["workspace"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "<div class=\"l-header\" id=\"l-header\"></div>\n<div class=\"l-content g-scrollable\" id=\"l-body\"></div>\n<div class=\"l-footer\" id=\"l-footer\"></div>";
  });

if (typeof exports === 'object' && exports) {module.exports = this["App"]["Templates"];}