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
        onCheck: onCheck,
        onRightClick: showMenu
    }
};

var zNodes = [];

$.fn.zTree.init($("#peopleTree"), setting, zNodes);

var zTree = $.fn.zTree.getZTreeObj("peopleTree");

var peopleTag = [1, 2, 3];
var groupCount = 0;
zTree.addNodes(null, {
    id: 0,
    isParent: true,
    name: "人员组",
    checked: true
});
peopleTag.forEach(function(elem) {
    treeNode = zTree.addNodes(zTree.getNodeByParam("id", 0, null), {
        id: 10 + elem,
        pId: 0,
        isParent: false,
        name: elem,
        checked: true
    });
})
//添加人员
var styleBlue = new ol.style.Style({
    image: new ol.style.Icon(({
        src: 'img/blue_man.png'
    }))
});
var vector = new ol.layer.Vector({
    title:'人员1',
    zIndex: 1,
    source: new ol.source.Vector()
});
var vector2 = new ol.layer.Vector({
    title:'人员2',
    zIndex: 1,
    source: new ol.source.Vector()
});
var vector3 = new ol.layer.Vector({
    title:'人员3',
    zIndex: 1,
    source: new ol.source.Vector()
});
map.addLayer(vector);
map.addLayer(vector2);
map.addLayer(vector3);
var point1 = new ol.geom.Point(ol.proj.fromLonLat([116.20063511, 39.85862116]));
var point2 = new ol.geom.Point(ol.proj.fromLonLat([116.21810105, 39.83500744]));
var point3 = new ol.geom.Point(ol.proj.fromLonLat([116.23814219, 39.82811664]));
//1
var pointFeature = new ol.Feature({
    geometry: point1
});
pointFeature.setId(1)
pointFeature.setStyle(styleBlue)
vector.getSource().addFeature(pointFeature);

//2
var pointFeature2 = new ol.Feature({
    geometry: point2
});
pointFeature2.setId(2)
pointFeature2.setStyle(styleBlue)
vector2.getSource().addFeature(pointFeature2);

//添3
var pointFeature3 = new ol.Feature({
    geometry: point3

});
pointFeature3.setId(3)
pointFeature3.setStyle(styleBlue)
vector3.getSource().addFeature(pointFeature3);
var pointFeatures = [pointFeature, pointFeature2, pointFeature3]
//选中事件
function onCheck(e, treeId, treeNode) {
    var layersArray = map.getLayers().getArray();
    if (treeNode.checked) {
        //选中
        if (treeNode.name == '人员组') {
            layersArray[1].setVisible(true)
            layersArray[2].setVisible(true)
            layersArray[3].setVisible(true)
        } else {
            map.getLayers().getArray()[treeNode.name].setVisible(true)
        }
    } else {
        if (treeNode.name == '人员组') {
            layersArray[1].setVisible(false)
            layersArray[2].setVisible(false)
            layersArray[3].setVisible(false)
        } else {
            layersArray[treeNode.name].setVisible(false)
        }
    }
}
// 显示菜单
function showMenu(event, treeId, treeNode) {
    var type = '';
    var x = event.clientX;
    var y = event.clientY;

    if (!treeNode) {
        type = 'root';
        zTree.cancelSelectedNode();
    } else if (treeNode && !treeNode.noR) {
        // noR 属性为 true 表示禁止右键菜单
        zTree.selectNode(treeNode);
    }

    // 不同节点显示的菜单可能不一样
    if ('root' === type) {
        $('#menu-item-delete').hide();
        $('#menu-item-rename').hide();
    } else {
        $('#menu-item-delete').show();
        $('#menu-item-rename').show();
    }

    $('#directory-tree-menu').css({
        left: x + 'px',
        top: y + 'px'
    }).show();

    $(document).on('mousedown', function(event) {
        if (!(event.target.id == 'directory-tree-menu' || $(event.target).parents('#directory-tree-menu').length > 0)) {
            hideMenu();
        }
    });
}
function hideMenu() {
    $('#directory-tree-menu').hide();
    $(document).off('mousedown');
}
