$(function () {
    $("#layer").click(function () {
        if ($(this).hasClass("active"))
            return false;
        $(this).toggleClass('active');
        $("#people").toggleClass('active');
        $("#peopleTree").toggle();
        $("#layerTree").toggle();
        return false;
    });

    $("#people").click(function () {
        if ($(this).hasClass("active"))
            return false;
        $(this).toggleClass('active');
        $("#layer").toggleClass('active');
        $("#peopleTree").toggle();
        $("#layerTree").toggle();
        return false;
    });

});
