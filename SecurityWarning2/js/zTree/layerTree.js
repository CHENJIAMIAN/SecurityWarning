$(function () {

    var setting = {
        check: {
            enable: true
        },

        view: {
            selectedMulti: false
        },
        edit: {
            enable: true,
            showRemoveBtn: false,
            showRenameBtn: false
        },
        data: {
            keep: {
                parent: true,
                leaf: true
            },
            simpleData: {
                enable: true
            }
        },
        callback: {
            onCheck: onCheck
        }
    };


    var zNodes = [
    ];


    $.fn.zTree.init($("#layerTree"), setting, zNodes);

    var zTree = $.fn.zTree.getZTreeObj("layerTree");




    var groupCount = 0;
    var layerCount = 0;
    map.getLayers().forEach(function (elem) {//图层组
        if (elem instanceof ol.layer.Group) {
            //添加父节点
            groupCount++;
            zTree.addNodes(null,
                {
                    id: groupCount,
                    isParent: true,
                    name: "图层组",
                    checked: true
                });
            elem.getLayers().forEach(function (lay) {//图层
                //添加子节点
                layerCount++;
                treeNode = zTree.addNodes(
                    zTree.getNodeByParam("id", groupCount, null),
                    {
                        id: groupCount * 10 + layerCount,
                        pId: 2,
                        isParent: false,
                        name: lay.get('title'),
                        checked: true
                    });
            })
        } else {
            //添加父节点
            var layerName = elem.get('title');//根图层
        }
    });

    function onCheck(e, treeId, treeNode) {
        var layerArray = layersToMap.getLayers().getArray()
        //layersToMap
        if (treeNode.isParent) {
            if (treeNode.checked) {//选中
                map.getLayers().getArray()[0].setVisible(true)
            }
            else {//取消选中
                map.getLayers().getArray()[0].setVisible(false)
            }
            return;
        }

        for (var j = 0; j < layerArray.length; j++)//层,长度可能是0
        {
            var layer = layerArray[j];

            if (treeNode.name == layer.get('title')) {
                if (treeNode.checked) {//选中
                    layer.setVisible(true)
                }
                else {//取消选中
                    layer.setVisible(false)
                }
            }
        }
        map.updateSize();
    }

});
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

