$(document).ready(function() {

   // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
   $('.table-responsive-stack').find("th").each(function (i) {
      $('.table-responsive-stack td:nth-child(' + (i + 1) + ')').prepend('<span class="table-responsive-stack-thead">'+ $(this).text() + ':</span> ');
      $('.table-responsive-stack-thead').hide();
   });

  $('.table-responsive-stack').each(function() {
    var thCount = $(this).find("th").length;
    var rowGrow = 100 / thCount + '%';
    //console.log(rowGrow);
    $(this).find("th, td").css('flex-basis', rowGrow);
  });

  function flexTable() {

    $('table').each(function() {
      var curTable = $(this);
      if ($(curTable).hasClass('table-responsive-stack')) {
        if ($(window).width() < 1024) {
          $(".table-responsive-stack").each(function (i) {
            $(this).find(".table-responsive-stack-thead").show();
            $(this).find('thead').hide();
          });
        // window is less than 768px
        } else {
          $(".table-responsive-stack").each(function (i) {
            $(this).find(".table-responsive-stack-thead").hide();
            $(this).find('thead').show();
          });
        }
      }
    });

  } // END flextable

  flexTable();

  window.onresize = function(event) {
    $('table').each(function() {
      var curTable = $(this);
      if ($(curTable).hasClass('table-responsive-stack')) {
        flexTable();
      }
    });
  }

});
