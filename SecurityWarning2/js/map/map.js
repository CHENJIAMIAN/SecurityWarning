parent.TiandituKey = "1868c5b20d2370d44dd9a2d00933ee60";
//图层控制----------------------------------------------------------------------------------------------------
//天地图的默认投影是EPSG:3857
{
    var TiandiMap_vec = new ol.layer.Tile({
        title: '天地图矢量图层',
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
            //parent.TiandituKey为天地图密钥
        })
    });
    var TiandiMap_img = new ol.layer.Tile({
        title: '天地图影像图层',
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
            //parent.TiandituKey为天地图密钥
        })
    });
    var TiandiMap_cva = new ol.layer.Tile({
        title: "天地图矢量注记图层",
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
            //parent.TiandituKey为天地图密钥
        })
    });
    var TiandiMap_cia = new ol.layer.Tile({
        title: '天地图影像注记图层',
        source: new ol.source.XYZ({
            url: "http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
            //parent.TiandituKey为天地图密钥
        })
    });
}
var Railway = new ol.layer.Tile({
    title: '铁路',
    source: new ol.source.TileWMS({
        projection: 'EPSG:3857',
        url: 'http://localhost:8080/geoserver/myWorkSpace/wms',
        params: {
            'FORMAT': "image/png",
            'VERSION': '1.1.1',
            tiled: true,
            "LAYERS": 'myWorkSpace:Railway',
            "exceptions": 'application/vnd.ogc.se_inimage',
            tilesOrigin: 116.19182584430769 + "," + 39.81643238561958
        }
    })
});
var safeArea = new ol.layer.Vector({
    title: '安全区',
    source: new ol.source.Vector({
        url: 'http://localhost:8080/geoserver/myWorkSpace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=myWorkSpace%3AsafeArea&maxFeatures=50&outputFormat=application%2Fjson',
        format: new ol.format.GeoJSON()
    })
});
var randomPoint1 = new ol.layer.Tile({
    title: '人员随机点',
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/myWorkSpace/wms',
        params: {
            'FORMAT': "image/png",
            'VERSION': '1.1.1',
            tiled: true,
            "LAYERS": 'myWorkSpace:randomPoint1',
            "exceptions": 'application/vnd.ogc.se_inimage',
            tilesOrigin: 116.20068289008697 + "," + 39.85454059338922
        }
    })
});
var layersToMap = new ol.layer.Group({
    title: '图层组',
    layers: [TiandiMap_img, TiandiMap_vec, TiandiMap_cva, Railway, safeArea, ]
});
//实例化Map对象加载地图
var map = new ol.Map({
    //地图容器div的ID
    target: 'mapCon',
    //地图容器中加载的图层
    layers: [layersToMap],
    //地图视图设置
    view: new ol.View({
        center: ol.proj.fromLonLat([116.21582584430769, 39.84043238561958]),
        zoom: 14

    }),
    controls: ol.control.defaults().extend([//加载空控件
    new ol.control.OverviewMap({
        //鹰眼控件展开时功能按钮上的标识（网页的JS的字符编码）
        collapseLabel: '\u00BB',
        //鹰眼控件折叠时功能按钮上的标识（网页的JS的字符编码）
        label: '\u00AB',
        //初始为展开显示方式
        collapsed: false
    }), new ol.control.FullScreen()])
});

//地图基础操作----------------------------------------------------------------------------------------------------
$(function() {
    var dragZoomOut = new ol.interaction.DragZoom({
        condition: ol.events.condition.always,
        out: false,
        // 此处为设置拉框完成时放大还是缩小，当out为true时，为缩小，当out为false时，为放大
    })
    var dragZoomIn = new ol.interaction.DragZoom({
        condition: ol.events.condition.always,
        out: true,
        // 此处为设置拉框完成时放大还是缩小，当out为true时，为缩小，当out为false时，为放大
    });

    var measureSourceLay = new ol.source.Vector();
    //图层数据源 //加载测量的绘制矢量层
    var measureLay = new ol.layer.Vector({
        source: measureSourceLay,
        style: new ol.style.Style({
            //图层样式
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'//填充颜色
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                //边框颜色
                width: 2// 边框宽度
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });
    var drawLineControl = new ol.interaction.Draw({
        source: measureSourceLay,
        //测量绘制层数据源
        type: /** @type {ol.geom.GeometryType} */
        ('LineString'),
        //几何图形类型
        style: new ol.style.Style({
            //绘制几何图形的样式
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });
    var drawAreaControl = new ol.interaction.Draw({
        source: measureSourceLay,
        //测量绘制层数据源
        type: /** @type {ol.geom.GeometryType} */
        ('Polygon'),
        //几何图形类型
        style: new ol.style.Style({
            //绘制几何图形的样式
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });

    var sketch, helpTooltipElement, helpTooltipOverLay, measureTooltipElement, measureTooltipOverLay;

    function clearMeasure() {
        measureSourceLay.clear();
        map.removeLayer(measureLay);
        map.getOverlays().clear();
        map.removeInteraction(drawLineControl);
        map.removeInteraction(drawAreaControl);
    }
    function startMeasure(drawControl) {
        //'Polygon' : 'LineString'
        clearMeasure();
        map.addInteraction(drawControl);

        map.addLayer(measureLay);

        createMeasureTooltip();
        //创建测量工具提示框
        createHelpTooltip();
        //创建帮助提示框

        map.on('pointermove', pointerMoveHandler);
        //地图容器绑定鼠标移动事件，动态显示帮助提示框内容
        //地图绑定鼠标移出事件，鼠标移出时为帮助提示框设置隐藏样式
        $(map.getViewport()).on('mouseout', function() {
            $(helpTooltipElement).addClass('hidden');
        });

        var listener;
        //绑定交互绘制工具开始绘制的事件
        drawControl.on('drawstart', function(evt) {
            sketch = evt.feature;
            //绘制的要素
            var tooltipCoord = evt.coordinate;
            // 绘制的坐标
            //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
            listener = sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                //绘制几何要素
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(/** @type {ol.geom.Polygon} */
                    (geom));
                    //面积值
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    //坐标
                } else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(/** @type {ol.geom.LineString} */
                    (geom));
                    //长度值
                    tooltipCoord = geom.getLastCoordinate();
                    //坐标
                }
                measureTooltipElement.innerHTML = output;
                //将测量值设置到测量工具提示框中显示
                measureTooltipOverLay.setPosition(tooltipCoord);
                //设置测量工具提示框的显示位置
            });
        }, this);
        //绑定交互绘制工具结束绘制的事件
        drawControl.on('drawend', function(evt) {
            measureTooltipElement.className = 'tooltip tooltip-static';
            //设置测量提示框的样式
            measureTooltipOverLay.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            //置空当前绘制的要素对象
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            //置空测量工具提示框对象
            createMeasureTooltip();
            //重新创建一个测试工具提示框显示结果
            ol.Observable.unByKey(listener);
        }, this);
    }
    function createHelpTooltip() {
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'tooltip hidden';
        helpTooltipOverLay = new ol.Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(helpTooltipOverLay);
    }
    function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';
        measureTooltipOverLay = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        map.addOverlay(measureTooltipOverLay);
    }
    var formatLength = function(line) {
        var length = Math.round(line.getLength() * 100) / 100;
        //直接得到线的长度
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
            //换算成KM单位
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
            //m为单位
        }
        return output;
        //返回线的长度
    };
    var formatArea = function(polygon) {
        var area = polygon.getArea();
        //直接获取多边形的面积
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
            //换算成KM单位
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
            //m为单位
        }
        return output;
        //返回多边形的面积
    };
    var pointerMoveHandler = function(evt) {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = '点击开始绘图';
        //当前默认提示信息
        var continuePolygonMsg = '点击继续绘制多边形';
        var continueLineMsg = '点击继续画线';
        //判断绘制几何类型设置相应的帮助提示信息
        if (sketch) {
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
                //绘制多边形时提示相应内容
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
                //绘制线时提示相应内容
            }
        }
        helpTooltipElement.innerHTML = helpMsg;
        //将提示信息设置到对话框中显示
        helpTooltipOverLay.setPosition(evt.coordinate);
        //设置帮助提示框的位置
        $(helpTooltipElement).removeClass('hidden');
        //移除帮助提示框的隐藏样式进行显示
    };

    //============================================================================================
    $("#zoomOut").click(function() {
        dragZoomOut.setActive(true);
        map.addInteraction(dragZoomOut);
        document.querySelector("#mapCon").style.cursor = "crosshair";
    });
    $("#zoomIn").click(function() {
        dragZoomIn.setActive(true);
        map.addInteraction(dragZoomIn);
        document.querySelector("#mapCon").style.cursor = "crosshair";

    });
    $("#pan").click(function() {
        dragZoomIn.setActive(false);
        dragZoomOut.setActive(false);

        document.querySelector("#mapCon").style.cursor = "default";

    });
    $("#clear").click(function() {
        clearMeasure();
    })
    $("#fullExtent").click(function() {
        map.getView().setCenter(ol.proj.fromLonLat([116.21582584430769, 39.84043238561958]));
        map.getView().setZoom(14);
    });
    $("#measureLine").click(function() {
        startMeasure(drawLineControl)
    });
    $("#measureArea").click(function() {
        startMeasure(drawAreaControl)
    });
    $("#closeMapOp").click(function() {
        $("#mapOp").animate({
            width: 'toggle'
        }, 150);
        $("#closeMapOp").hide();
        $("#openMapOp").show();
    });
    $("#openMapOp").click(function() {
        $("#mapOp").animate({
            width: 'toggle'
        }, 150);
        $("#openMapOp").hide();
        $("#closeMapOp").show();
    });
    //============================================================================================
    var lineLayerSource, lineLayer, drawLineInteraction;
    //添加人员路径
    $('#addLayer').click(()=>{
        map.removeInteraction(drawLineInteraction);
        map.removeLayer(lineLayer)

        // 添加一个绘制的线使用的layer
        lineLayerSource = new ol.source.Vector()
        lineLayer = new ol.layer.Vector({
            source: lineLayerSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    size: 1
                })
            })
        })
        map.addLayer(lineLayer);
        drawLineInteraction = new ol.interaction.Draw({
            type: 'LineString',
            source: lineLayer.getSource()// 注意设置source，这样绘制好的线，就会添加到这个source里
        });
        map.addInteraction(drawLineInteraction);

    }
    )
    $('#undoAdded').click(()=>{
        //移除第一个lineLayerSource.removeFeature(lineLayerFeatures[0])
        var lineLayerFeatures = lineLayerSource.getFeatures();
        if (lineLayerFeatures.length > 0) {
            // 移除最后一个
            lineLayerSource.removeFeature(lineLayerFeatures[lineLayerFeatures.length - 1])
        }
    }
    )
    $('#cancelAdd').click(()=>{
        map.removeInteraction(drawLineInteraction);
        map.removeLayer(lineLayer)
    }
    )
    //============================================================================================
    //开始编辑
    $('#StartEdit').click(()=>{
        map.removeInteraction(selectInteraction)
        map.removeInteraction(modifyInteraction)
        map.removeInteraction(drawInteraction);

        map.addInteraction(selectInteraction)
        map.addInteraction(modifyInteraction)
    }
    )
    $('#addSafeArea').click(()=>{
        map.removeInteraction(drawInteraction);
        map.removeInteraction(selectInteraction)
        map.removeInteraction(modifyInteraction)

        map.addInteraction(drawInteraction);
    }
    )
    $('#cancelEdit').click(()=>{
        map.removeInteraction(selectInteraction)
        map.removeInteraction(modifyInteraction)
        map.removeInteraction(drawInteraction);
    }
    )
});
/**修改安全区***/
// 选择器
var selectInteraction = new ol.interaction.Select({
    // 关键： 设置过了条件，可以用feature来写过滤，也可以用layer来写过滤
    filter: function(feature, layer) {
        return layer === safeArea;
    }
});
// 监听选中事件，然后在事件处理函数中改变被选中的`feature`的样式
selectInteraction.on('select', function(event) {
    event.selected[0];
})
// 修改器
var modifyInteraction = new ol.interaction.Modify({
    deleteCondition: function(event) {
        return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
    },
    features: selectInteraction.getFeatures()
});
modifyInteraction.on('modifyend', function(e) {
    // 把修改完成的feature暂存起来
    var modifiedFeatures = e.features;
    saveModify(modifiedFeatures);
});
function saveModify(modifiedFeatures) {
    if (modifiedFeatures && modifiedFeatures.getLength() > 0) {
        // 转换坐标
        var modifiedFeature = modifiedFeatures.item(0).clone();
        // 注意ID是必须，通过ID才能找到对应修改的feature
        modifiedFeature.setId(modifiedFeatures.item(0).getId());
        // 调换经纬度坐标，以符合wfs协议中经纬度的位置
        modifiedFeature.getGeometry().applyTransform(function(flatCoordinates, flatCoordinates2, stride) {
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var y = flatCoordinates[j];
                var x = flatCoordinates[j + 1];
                flatCoordinates[j] = x;
                flatCoordinates[j + 1] = y;
            }
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var xy = ol.proj.transform([flatCoordinates[j + 1], flatCoordinates[j]], 'EPSG:3857', 'EPSG:4326');
                flatCoordinates[j + 1] = xy[0];
                flatCoordinates[j] = xy[1];
            }

        });
        modifyWfs([modifiedFeature]);
    }
}
//
function saveDraw(drawedFeature) {
    if (drawedFeature) {
        var geometry = drawedFeature.getGeometry().clone();
        geometry.applyTransform(function(flatCoordinates, flatCoordinates2, stride) {
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var y = flatCoordinates[j];
                var x = flatCoordinates[j + 1];
                flatCoordinates[j] = x;
                flatCoordinates[j + 1] = y;
            }
        });
        // 设置feature对应的属性，这些属性是根据数据源的字段来设置的
        var newFeature = new ol.Feature();
        newFeature.setGeometry(new ol.geom.MultiPolygon([geometry.getCoordinates()]));
        newFeature.getGeometry().applyTransform(function(flatCoordinates, flatCoordinates2, stride) {
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var y = flatCoordinates[j];
                var x = flatCoordinates[j + 1];
                flatCoordinates[j] = x;
                flatCoordinates[j + 1] = y;
            }
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var xy = ol.proj.transform([flatCoordinates[j], flatCoordinates[j + 1]], 'EPSG:3857', 'EPSG:4326');
                flatCoordinates[j] = xy[0];
                flatCoordinates[j + 1] = xy[1];
            }

        });
        newFeature.setProperties({
            'Id': 0
        })
        addWfs([newFeature]);

        // 3秒后，自动刷新页面上的feature
        setTimeout(function() {
            drawLayer.getSource().clear();
            queryWfs();
        }, 1000);
        drawedFeature = null;
    }
}
//查询安全区图层
function queryWfs() {
    map.removeLayer(layersToMap)
    safeArea = new ol.layer.Vector({
        title: '安全区',
        source: new ol.source.Vector({
            url: 'http://localhost:8080/geoserver/myWorkSpace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=myWorkSpace%3AsafeArea&maxFeatures=50&outputFormat=application%2Fjson',
            format: new ol.format.GeoJSON()
        })
    });
    layersToMap = new ol.layer.Group({
        title: '图层组',
        layers: [TiandiMap_img, TiandiMap_vec, TiandiMap_cva, Railway, safeArea, ]
    });
    map.addLayer(layersToMap)
}
// 把修改提交到服务器端
function modifyWfs(features) {
    var WFSTSerializer = new ol.format.WFS();
    var featObject = WFSTSerializer.writeTransaction(null, features, null, {
        featureType: 'safeArea',
        featureNS: 'myWorkSpaceURI',
    });
    // 转换为xml内容发送到服务器端
    var featString = new XMLSerializer().serializeToString(featObject);
    var featString2 = featString.replace('geometry', 'the_geom');
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8080/geoserver/wfs?service=wfs');
    // 指定内容为xml类型
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featString2);
}
// 添加到服务器端
function addWfs(features) {
    var WFSTSerializer = new ol.format.WFS();
    var featObject = WFSTSerializer.writeTransaction(features, null, null, {
        featureType: 'safeArea',
        featureNS: 'myWorkSpaceURI',
    });
    var serializer = new XMLSerializer();
    var featString = serializer.serializeToString(featObject);
    var featString2 = featString.replace('geometry', 'the_geom').replace('geometry', 'the_geom');
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8080/geoserver/wfs?service=wfs');
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featString2);
}
// 在服务器端删除feature
function deleteWfs(features) {
    var WFSTSerializer = new ol.format.WFS();
    var featObject = WFSTSerializer.writeTransaction(null, null, features, {
        featureType: 'safeArea',
        featureNS: 'myWorkSpaceURI'
    });
    var serializer = new XMLSerializer();
    var featString = serializer.serializeToString(featObject);
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8080/geoserver/wfs?service=wfs');
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featString);
}

// 创建用于新绘制feature的layer
var drawLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 5
        })
    })
});
// 添加绘制新图形的interaction，用于添加新的线条
var drawInteraction = new ol.interaction.Draw({
    type: 'Polygon',
    source: drawLayer.getSource()
});
drawInteraction.on('drawend', function(e) {
    // 绘制结束时暂存绘制的feature
    var drawedFeature = e.feature;
    saveDraw(drawedFeature);
});

$(document).keydown(function(event) {
    if (event.keyCode == 46) {
        // 删选择器选中的feature
        if (selectInteraction.getFeatures().getLength() > 0) {
            deleteWfs([selectInteraction.getFeatures().item(0)]);
            // 3秒后自动更新features
            setTimeout(function() {
                selectInteraction.getFeatures().clear();
                queryWfs();
            }, 1000);
        }
    }
});
