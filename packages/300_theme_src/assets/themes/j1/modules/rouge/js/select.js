/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/modules/rouge/js/select.js
 #  Rouge theme selector
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/rouge-ruby/rouge
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (c) 2012 Jeanine Adkisson
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 #  Rouge is licensed under the MIT License.
 #  See: https://github.com/rouge-ruby/rouge/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

$(document).ready(function() {

 $('.dropdown-menu a').click(function(){
    $('#selected').html("Current Selection: <span class='bg-info text-white p-3 mb-2'>"+$(this).text()+"</span>");
  });

});


function removeAllSyntaxStyles(){
        $('link[rel=stylesheet][href*="syntax"]').remove();
}

function addStyle(themename) {
    $('<link>').attr('rel','stylesheet')
          .attr('type','text/css')
          .attr('href','css/syntax-'+themename+'.css')
          .appendTo('head');
}

function reaplyStyles(themename){
    removeAllSyntaxStyles();
    addStyle(themename);
    return true;
}
