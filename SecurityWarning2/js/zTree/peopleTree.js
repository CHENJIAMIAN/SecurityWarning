$(()=>{
    //添加人员 图层到地图  遍历显示手机端发送来的 所有人员
    {
        var styleBlue = new ol.style.Style({
            image: new ol.style.Icon(({
                src: 'img/blue_man.png'
            }))
        });
        var vector = new ol.layer.Vector({
            title: '人员1',
            treeNdoeId: 1,
            zIndex: 1,
            source: new ol.source.Vector()
        });
        var vector2 = new ol.layer.Vector({
            title: '人员2',
            treeNdoeId: 2,
            zIndex: 1,
            source: new ol.source.Vector()
        });
        var vector3 = new ol.layer.Vector({
            title: '人员3',
            treeNdoeId: 3,
            zIndex: 1,
            source: new ol.source.Vector()
        });
        map.addLayer(vector);
        map.addLayer(vector2);
        map.addLayer(vector3);

        //遍历显示手机端发送来的 所有人员
        vectorPhonePeo = new ol.layer.Vector({
            title: '手机人员',
            treeNdoeId: 4,
            zIndex: 1,
            source: new ol.source.Vector()
        });
        map.addLayer(vectorPhonePeo);
        setInterval(()=>{
            fetch('https://api2.bmob.cn/1/classes/position', {
                headers: {
                    'X-Bmob-Application-Id': 'ae69ae4ad1b9328f1993c62a637454a7',
                    'X-Bmob-REST-API-Key': '05d377b293e63f9f9e22788154af1449',
                },
                method: 'GET',
            }).then(response=>response.json()).then(function(result) {
                for (var i = 0; i < result.results.length; i++) {
                    if (vectorPhonePeo.getSource().getFeatures().length != result.results.length) {
                        var pointGeom = new ol.geom.Point(ol.proj.fromLonLat([result.results[i].lon, result.results[i].lat]));
                        var pointFeaturePhonePeo = new ol.Feature();
                        pointFeaturePhonePeo.setGeometryName(result.results[i].name);
                        pointFeaturePhonePeo.setGeometry(pointGeom)
                        pointFeaturePhonePeo.setStyle(styleBlue)
                        vectorPhonePeo.getSource().addFeature(pointFeaturePhonePeo);
                    } else {
                        vectorPhonePeo.getSource().getFeatures().forEach((elem)=>{
                            if (elem.getGeometryName() == result.results[i].name) {
                                elem.getGeometry().setCoordinates(ol.proj.fromLonLat([result.results[i].lon, result.results[i].lat]));
                            }
                            //else {
                            //                                 var pointGeom = new ol.geom.Point(ol.proj.fromLonLat([result.results[i].lon, result.results[i].lat]));
                            //                                 var pointFeaturePhonePeo = new ol.Feature();
                            //                                 pointFeaturePhonePeo.setGeometryName(result.results[i].name);
                            //                                 pointFeaturePhonePeo.setGeometry(pointGeom)
                            //                                 pointFeaturePhonePeo.setStyle(styleBlue)
                            //                                 vectorPhonePeo.getSource().addFeature(pointFeaturePhonePeo);
                            //                             }
                        }
                        )
                    }

                }

            })
        }
        , 2000);
        //1s 判断一次，手机人员是否安全，并上传IsSafe到Bmob云数据库
        {
            setInterval(()=>{
                var boolAllSafe = true;
                vectorPhonePeo.getSource().getFeatures().forEach((elem)=>{
                    var pt = turf.point(elem.getGeometry().getFlatCoordinates());
                    var isSafe = isInPoly(pt);

                    renderWarning(vectorPhonePeo, elem, isSafe);
                    var isSafenum = 0;
                    if (isSafe) {
                        isSafenum = 1;
                    } else {
                        isSafenum = 0;
                        boolAllSafe = false;
                    }
                    //上传IsSafe到Bmob云数据库
                    fetch('https://api2.bmob.cn/1/classes/IsSafe?where={"name":"' + elem.getGeometryName() + '"}', {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Bmob-Application-Id': 'ae69ae4ad1b9328f1993c62a637454a7',
                            'X-Bmob-REST-API-Key': '05d377b293e63f9f9e22788154af1449',
                        },
                        method: 'PUT',
                        body: '{"isSafe":' + isSafenum + '}',
                    })
                    //.then(response=>response.json()).then(function(result) {//console.log('put isSafe 结果', result)
                    //                     })
                }
                );
                if (boolAllSafe) //所有人员 都安全
                {
                    $('#' + "手机人员").css('background', '')
                    $('#alertLightOn').hide();
                    $('#alertLightOff').show();

                } else {
                    //layer的人员变红
                    $('#' + "手机人员").css('background', 'red')
                    //警报灯亮
                    $('#alertLightOn').show();
                    $('#alertLightOff').hide();
                }
            }
            , 1000)
        }

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
        //var pointFeatures = [pointFeature, pointFeature2, pointFeature3]
    }

    //初始化人员树,绑定选中事件
    {
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

        var peopleVectors = [vector, vector2, vector3, vectorPhonePeo];
        var groupCount = 0;
        //添加人员根节点
        zTree.addNodes(null, {
            id: 0,
            isParent: true,
            name: "人员组",
            checked: true
        });

        peopleVectors.forEach(function(vector) {
            treeNode = zTree.addNodes(zTree.getNodeByParam("id", 0, null), {
                //在根节点下添加人员子节点
                id: 10 + vector.values_.treeNdoeId.toString(),
                vectorId: vector.values_.treeNdoeId,
                //id为 10x
                pId: 0,
                isParent: false,
                name: vector.values_.title,
                //名字为tag
                checked: true
            });
        })

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
                    //根据节点名(数字)作为索引,来获取图层
                    layersArray[treeNode.vectorId].setVisible(true)
                }
            } else {
                if (treeNode.name == '人员组') {
                    layersArray[1].setVisible(false)
                    layersArray[2].setVisible(false)
                    layersArray[3].setVisible(false)
                } else {
                    layersArray[treeNode.vectorId].setVisible(false)
                }
            }
        }
        // 显示右键菜单
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
            if ('root' === type)
                return;

            $('#menu-item-delete').show();
            $('#menu-item-rename').show();

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
    }

    //模拟人员离开安全区
    {
        //弹窗报警
        layertipIndex = layer.open({
            type: 1,
            title: "预警窗口",
            //不显示标题
            skin: 'layui-layer-demo',
            //样式类名
            anim: 2,
            closeBtn: 0,
            shade: false,
            //宽度\高度
            area: ['200px', '250px'],
            offset: ['300px', '10px'],
            //宽高
            content: '<ul class="list-group">  <li class="list-group-item" id="人员1">人员1</li>  <li class="list-group-item"  id="人员2">人员2</li>  ' + '<li class="list-group-item"  id="人员3">人员3</li> <li class="list-group-item"  id="手机人员">手机人员</li>    </ul>'
        });

        //人员路径
        var jsonObj, cid0, cid1, cid2;
        //获取人员路径
        var InstanPeopleFromJson = (tag)=>{
            jsonObj = JSON.parse('{"type":"FeatureCollection","features":[{"type":"Feature","id":"randomPoint2.1","geometry":{"type":"Point","coordinates":[116.20063511,39.85862116]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.2","geometry":{"type":"Point","coordinates":[116.20079936,39.85863333]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.3","geometry":{"type":"Point","coordinates":[116.20099971,39.85864817]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.4","geometry":{"type":"Point","coordinates":[116.20110531,39.858656]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.5","geometry":{"type":"Point","coordinates":[116.20116148,39.85866016]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.6","geometry":{"type":"Point","coordinates":[116.20131266,39.85867136]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.7","geometry":{"type":"Point","coordinates":[116.20142136,39.85867941]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.8","geometry":{"type":"Point","coordinates":[116.20143686,39.85868056]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.9","geometry":{"type":"Point","coordinates":[116.2015105,39.85868601]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.10","geometry":{"type":"Point","coordinates":[116.20176052,39.85870453]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.11","geometry":{"type":"Point","coordinates":[116.20195151,39.85871868]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.12","geometry":{"type":"Point","coordinates":[116.20195271,39.85871877]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.13","geometry":{"type":"Point","coordinates":[116.20222674,39.85873907]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.14","geometry":{"type":"Point","coordinates":[116.20223913,39.85873999]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.15","geometry":{"type":"Point","coordinates":[116.20240704,39.85875243]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.16","geometry":{"type":"Point","coordinates":[116.20243762,39.85875469]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.17","geometry":{"type":"Point","coordinates":[116.20278744,39.85878061]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.18","geometry":{"type":"Point","coordinates":[116.20282888,39.85878368]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.19","geometry":{"type":"Point","coordinates":[116.20332005,39.85882006]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.20","geometry":{"type":"Point","coordinates":[116.20340615,39.85871514]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.21","geometry":{"type":"Point","coordinates":[116.20345217,39.85864095]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.22","geometry":{"type":"Point","coordinates":[116.20364648,39.85832773]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.23","geometry":{"type":"Point","coordinates":[116.20364973,39.8583225]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.24","geometry":{"type":"Point","coordinates":[116.20391799,39.85789008]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.25","geometry":{"type":"Point","coordinates":[116.2040775,39.85763295]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.26","geometry":{"type":"Point","coordinates":[116.20417911,39.85746917]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.27","geometry":{"type":"Point","coordinates":[116.20425245,39.85735096]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.28","geometry":{"type":"Point","coordinates":[116.2043166,39.8569254]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.29","geometry":{"type":"Point","coordinates":[116.20432564,39.85676459]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.30","geometry":{"type":"Point","coordinates":[116.20434217,39.85647051]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.31","geometry":{"type":"Point","coordinates":[116.2043573,39.85620139]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.32","geometry":{"type":"Point","coordinates":[116.20436142,39.85612811]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.33","geometry":{"type":"Point","coordinates":[116.204367,39.85602894]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.34","geometry":{"type":"Point","coordinates":[116.20436788,39.85601336]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.35","geometry":{"type":"Point","coordinates":[116.20436889,39.85599524]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.36","geometry":{"type":"Point","coordinates":[116.20437233,39.85593407]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.37","geometry":{"type":"Point","coordinates":[116.20437423,39.85590032]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.38","geometry":{"type":"Point","coordinates":[116.20438869,39.85564307]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.39","geometry":{"type":"Point","coordinates":[116.20439494,39.85553192]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.40","geometry":{"type":"Point","coordinates":[116.20440153,39.85541486]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.41","geometry":{"type":"Point","coordinates":[116.20440173,39.85541119]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.42","geometry":{"type":"Point","coordinates":[116.20440241,39.85539905]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.43","geometry":{"type":"Point","coordinates":[116.20441073,39.85525113]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.44","geometry":{"type":"Point","coordinates":[116.20441968,39.85509196]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.45","geometry":{"type":"Point","coordinates":[116.20443042,39.85490094]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.46","geometry":{"type":"Point","coordinates":[116.20443507,39.8548183]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.47","geometry":{"type":"Point","coordinates":[116.20444086,39.85471522]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.48","geometry":{"type":"Point","coordinates":[116.20444348,39.8546686]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.49","geometry":{"type":"Point","coordinates":[116.204463,39.85432148]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.50","geometry":{"type":"Point","coordinates":[116.20446447,39.85429541]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.51","geometry":{"type":"Point","coordinates":[116.20448305,39.85396493]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.52","geometry":{"type":"Point","coordinates":[116.20456135,39.85373933]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.53","geometry":{"type":"Point","coordinates":[116.20541274,39.85393104]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.54","geometry":{"type":"Point","coordinates":[116.20558188,39.85396912]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.55","geometry":{"type":"Point","coordinates":[116.20634413,39.85414076]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.56","geometry":{"type":"Point","coordinates":[116.20647119,39.85416936]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.57","geometry":{"type":"Point","coordinates":[116.20649411,39.85417453]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.58","geometry":{"type":"Point","coordinates":[116.2065713,39.85419191]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.59","geometry":{"type":"Point","coordinates":[116.20742857,39.85438493]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.60","geometry":{"type":"Point","coordinates":[116.20749214,39.85439925]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.61","geometry":{"type":"Point","coordinates":[116.20779288,39.85446696]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.62","geometry":{"type":"Point","coordinates":[116.20779587,39.85446764]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.63","geometry":{"type":"Point","coordinates":[116.20803977,39.85452256]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.64","geometry":{"type":"Point","coordinates":[116.20805547,39.85452609]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.65","geometry":{"type":"Point","coordinates":[116.20821507,39.85456203]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.66","geometry":{"type":"Point","coordinates":[116.20831849,39.85458531]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.67","geometry":{"type":"Point","coordinates":[116.20857436,39.85464293]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.68","geometry":{"type":"Point","coordinates":[116.20869816,39.8546708]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.69","geometry":{"type":"Point","coordinates":[116.20880328,39.85469447]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.70","geometry":{"type":"Point","coordinates":[116.20932452,39.85481184]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.71","geometry":{"type":"Point","coordinates":[116.20939606,39.85482794]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.72","geometry":{"type":"Point","coordinates":[116.20956716,39.85486647]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.73","geometry":{"type":"Point","coordinates":[116.20957304,39.85486779]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.74","geometry":{"type":"Point","coordinates":[116.20983302,39.85492633]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.75","geometry":{"type":"Point","coordinates":[116.21001969,39.85496836]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.76","geometry":{"type":"Point","coordinates":[116.21016712,39.85500156]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.77","geometry":{"type":"Point","coordinates":[116.21031151,39.85503407]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.78","geometry":{"type":"Point","coordinates":[116.21032227,39.85503649]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.79","geometry":{"type":"Point","coordinates":[116.21041944,39.85505837]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.80","geometry":{"type":"Point","coordinates":[116.21068451,39.85511806]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.81","geometry":{"type":"Point","coordinates":[116.2107586,39.85513474]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.82","geometry":{"type":"Point","coordinates":[116.21132591,39.85526248]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.83","geometry":{"type":"Point","coordinates":[116.21138924,39.85527674]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.84","geometry":{"type":"Point","coordinates":[116.2116591,39.8553375]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.85","geometry":{"type":"Point","coordinates":[116.21231732,39.85548571]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.86","geometry":{"type":"Point","coordinates":[116.21235661,39.85549456]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.87","geometry":{"type":"Point","coordinates":[116.21289643,39.85561611]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.88","geometry":{"type":"Point","coordinates":[116.21317124,39.85561645]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.89","geometry":{"type":"Point","coordinates":[116.21325474,39.85553551]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.90","geometry":{"type":"Point","coordinates":[116.21333428,39.85545843]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.91","geometry":{"type":"Point","coordinates":[116.21336968,39.85542411]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.92","geometry":{"type":"Point","coordinates":[116.21351812,39.85528024]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.93","geometry":{"type":"Point","coordinates":[116.21366408,39.85513877]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.94","geometry":{"type":"Point","coordinates":[116.21374776,39.85505767]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.95","geometry":{"type":"Point","coordinates":[116.21384588,39.85496256]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.96","geometry":{"type":"Point","coordinates":[116.2139068,39.85490352]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.97","geometry":{"type":"Point","coordinates":[116.21420097,39.8546184]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.98","geometry":{"type":"Point","coordinates":[116.21428384,39.85453808]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.99","geometry":{"type":"Point","coordinates":[116.21435561,39.85446852]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.100","geometry":{"type":"Point","coordinates":[116.21460604,39.8542258]},"geometry_name":"the_geom","properties":{"CID":0}},{"type":"Feature","id":"randomPoint2.101","geometry":{"type":"Point","coordinates":[116.21810105,39.83500744]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.102","geometry":{"type":"Point","coordinates":[116.21809015,39.83503188]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.103","geometry":{"type":"Point","coordinates":[116.21806059,39.83509813]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.104","geometry":{"type":"Point","coordinates":[116.21801716,39.83519546]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.105","geometry":{"type":"Point","coordinates":[116.21800924,39.83521324]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.106","geometry":{"type":"Point","coordinates":[116.21794344,39.83536072]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.107","geometry":{"type":"Point","coordinates":[116.21786084,39.83554584]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.108","geometry":{"type":"Point","coordinates":[116.21785724,39.83555393]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.109","geometry":{"type":"Point","coordinates":[116.21776725,39.83575562]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.110","geometry":{"type":"Point","coordinates":[116.21775462,39.83578392]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.111","geometry":{"type":"Point","coordinates":[116.21774177,39.83581272]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.112","geometry":{"type":"Point","coordinates":[116.21761124,39.8361053]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.113","geometry":{"type":"Point","coordinates":[116.21761088,39.83610609]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.114","geometry":{"type":"Point","coordinates":[116.21758424,39.83616582]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.115","geometry":{"type":"Point","coordinates":[116.21753617,39.83627355]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.116","geometry":{"type":"Point","coordinates":[116.21753356,39.83627941]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.117","geometry":{"type":"Point","coordinates":[116.21738574,39.83661074]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.118","geometry":{"type":"Point","coordinates":[116.2173165,39.83676591]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.119","geometry":{"type":"Point","coordinates":[116.21728176,39.83684379]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.120","geometry":{"type":"Point","coordinates":[116.21726798,39.83687467]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.121","geometry":{"type":"Point","coordinates":[116.21715031,39.83713842]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.122","geometry":{"type":"Point","coordinates":[116.21693488,39.83762127]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.123","geometry":{"type":"Point","coordinates":[116.21676724,39.83799702]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.124","geometry":{"type":"Point","coordinates":[116.21682001,39.83813767]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.125","geometry":{"type":"Point","coordinates":[116.21687257,39.83823903]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.126","geometry":{"type":"Point","coordinates":[116.21690466,39.83830091]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.127","geometry":{"type":"Point","coordinates":[116.21692866,39.8383472]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.128","geometry":{"type":"Point","coordinates":[116.21694464,39.83837801]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.129","geometry":{"type":"Point","coordinates":[116.21731714,39.83909635]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.130","geometry":{"type":"Point","coordinates":[116.217329,39.8391192]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.131","geometry":{"type":"Point","coordinates":[116.21741166,39.83927862]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.132","geometry":{"type":"Point","coordinates":[116.21744361,39.83934022]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.133","geometry":{"type":"Point","coordinates":[116.2174542,39.83936064]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.134","geometry":{"type":"Point","coordinates":[116.21746644,39.83938426]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.135","geometry":{"type":"Point","coordinates":[116.21762841,39.8396966]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.136","geometry":{"type":"Point","coordinates":[116.21781643,39.84005919]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.137","geometry":{"type":"Point","coordinates":[116.21787411,39.84017041]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.138","geometry":{"type":"Point","coordinates":[116.2178864,39.8401941]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.139","geometry":{"type":"Point","coordinates":[116.21812762,39.84065928]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.140","geometry":{"type":"Point","coordinates":[116.21818688,39.84077355]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.141","geometry":{"type":"Point","coordinates":[116.21824938,39.84089408]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.142","geometry":{"type":"Point","coordinates":[116.21830642,39.84100407]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.143","geometry":{"type":"Point","coordinates":[116.21833534,39.84105985]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.144","geometry":{"type":"Point","coordinates":[116.21838278,39.84115134]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.145","geometry":{"type":"Point","coordinates":[116.21847294,39.84132519]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.146","geometry":{"type":"Point","coordinates":[116.21870704,39.84177665]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.147","geometry":{"type":"Point","coordinates":[116.21874026,39.84184071]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.148","geometry":{"type":"Point","coordinates":[116.21883676,39.8420268]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.149","geometry":{"type":"Point","coordinates":[116.2189228,39.84219272]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.150","geometry":{"type":"Point","coordinates":[116.21903056,39.84240051]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.151","geometry":{"type":"Point","coordinates":[116.21904105,39.84242075]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.152","geometry":{"type":"Point","coordinates":[116.21908119,39.84249816]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.153","geometry":{"type":"Point","coordinates":[116.21908801,39.84251131]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.154","geometry":{"type":"Point","coordinates":[116.21908986,39.84251488]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.155","geometry":{"type":"Point","coordinates":[116.21911788,39.84256892]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.156","geometry":{"type":"Point","coordinates":[116.21920014,39.84272754]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.157","geometry":{"type":"Point","coordinates":[116.2192333,39.84279148]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.158","geometry":{"type":"Point","coordinates":[116.21929525,39.84291096]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.159","geometry":{"type":"Point","coordinates":[116.21932614,39.84297052]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.160","geometry":{"type":"Point","coordinates":[116.21910462,39.8433811]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.161","geometry":{"type":"Point","coordinates":[116.21887354,39.84364305]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.162","geometry":{"type":"Point","coordinates":[116.21885414,39.84366505]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.163","geometry":{"type":"Point","coordinates":[116.21878372,39.84374487]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.164","geometry":{"type":"Point","coordinates":[116.21857817,39.84397788]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.165","geometry":{"type":"Point","coordinates":[116.21853532,39.84402645]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.166","geometry":{"type":"Point","coordinates":[116.21834798,39.84423881]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.167","geometry":{"type":"Point","coordinates":[116.21811693,39.84450072]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.168","geometry":{"type":"Point","coordinates":[116.21785908,39.84479302]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.169","geometry":{"type":"Point","coordinates":[116.21785292,39.8448]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.170","geometry":{"type":"Point","coordinates":[116.21778304,39.84487922]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.171","geometry":{"type":"Point","coordinates":[116.21731177,39.84541342]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.172","geometry":{"type":"Point","coordinates":[116.21713945,39.84560876]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.173","geometry":{"type":"Point","coordinates":[116.21688814,39.84589364]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.174","geometry":{"type":"Point","coordinates":[116.21684135,39.84594669]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.175","geometry":{"type":"Point","coordinates":[116.21677647,39.84602023]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.176","geometry":{"type":"Point","coordinates":[116.21621829,39.84665297]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.177","geometry":{"type":"Point","coordinates":[116.21602426,39.84717324]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.178","geometry":{"type":"Point","coordinates":[116.21611977,39.84729827]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.179","geometry":{"type":"Point","coordinates":[116.21615303,39.84734182]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.180","geometry":{"type":"Point","coordinates":[116.21642311,39.84769537]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.181","geometry":{"type":"Point","coordinates":[116.21651605,39.84781703]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.182","geometry":{"type":"Point","coordinates":[116.21656477,39.84788081]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.183","geometry":{"type":"Point","coordinates":[116.21664876,39.84799076]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.184","geometry":{"type":"Point","coordinates":[116.21684177,39.84824343]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.185","geometry":{"type":"Point","coordinates":[116.21685691,39.84826326]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.186","geometry":{"type":"Point","coordinates":[116.21698872,39.8484358]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.187","geometry":{"type":"Point","coordinates":[116.21709949,39.84858081]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.188","geometry":{"type":"Point","coordinates":[116.21720644,39.84872082]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.189","geometry":{"type":"Point","coordinates":[116.21725644,39.84878627]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.190","geometry":{"type":"Point","coordinates":[116.21738524,39.84895488]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.191","geometry":{"type":"Point","coordinates":[116.21747455,39.8490718]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.192","geometry":{"type":"Point","coordinates":[116.21753176,39.84914669]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.193","geometry":{"type":"Point","coordinates":[116.21765465,39.84930757]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.194","geometry":{"type":"Point","coordinates":[116.21789412,39.84962105]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.195","geometry":{"type":"Point","coordinates":[116.2179618,39.84970966]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.196","geometry":{"type":"Point","coordinates":[116.21801898,39.84978451]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.197","geometry":{"type":"Point","coordinates":[116.21824683,39.85008279]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.198","geometry":{"type":"Point","coordinates":[116.21836297,39.85023483]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.199","geometry":{"type":"Point","coordinates":[116.21842704,39.8503187]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.200","geometry":{"type":"Point","coordinates":[116.21850961,39.85042679]},"geometry_name":"the_geom","properties":{"CID":1}},{"type":"Feature","id":"randomPoint2.201","geometry":{"type":"Point","coordinates":[116.23814219,39.82811664]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.202","geometry":{"type":"Point","coordinates":[116.23785409,39.8279542]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.203","geometry":{"type":"Point","coordinates":[116.23773067,39.82788461]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.204","geometry":{"type":"Point","coordinates":[116.23701954,39.82748366]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.205","geometry":{"type":"Point","coordinates":[116.23664072,39.82727007]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.206","geometry":{"type":"Point","coordinates":[116.23659431,39.8272439]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.207","geometry":{"type":"Point","coordinates":[116.23656898,39.82722962]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.208","geometry":{"type":"Point","coordinates":[116.23650794,39.8271952]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.209","geometry":{"type":"Point","coordinates":[116.2363068,39.82708179]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.210","geometry":{"type":"Point","coordinates":[116.23612212,39.82697766]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.211","geometry":{"type":"Point","coordinates":[116.2359291,39.82686884]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.212","geometry":{"type":"Point","coordinates":[116.23574636,39.8267658]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.213","geometry":{"type":"Point","coordinates":[116.23548358,39.82661764]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.214","geometry":{"type":"Point","coordinates":[116.23541263,39.82657763]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.215","geometry":{"type":"Point","coordinates":[116.23485625,39.82626393]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.216","geometry":{"type":"Point","coordinates":[116.23469828,39.82617486]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.217","geometry":{"type":"Point","coordinates":[116.23468158,39.82616544]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.218","geometry":{"type":"Point","coordinates":[116.23467556,39.82616205]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.219","geometry":{"type":"Point","coordinates":[116.23382477,39.82593223]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.220","geometry":{"type":"Point","coordinates":[116.23380172,39.82624505]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.221","geometry":{"type":"Point","coordinates":[116.23378818,39.8264288]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.222","geometry":{"type":"Point","coordinates":[116.23378074,39.82652969]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.223","geometry":{"type":"Point","coordinates":[116.23377272,39.82663855]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.224","geometry":{"type":"Point","coordinates":[116.23377208,39.82664732]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.225","geometry":{"type":"Point","coordinates":[116.23373738,39.82711821]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.226","geometry":{"type":"Point","coordinates":[116.23373413,39.82716236]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.227","geometry":{"type":"Point","coordinates":[116.23371209,39.82746142]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.228","geometry":{"type":"Point","coordinates":[116.23368777,39.82779148]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.229","geometry":{"type":"Point","coordinates":[116.23367531,39.82796061]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.230","geometry":{"type":"Point","coordinates":[116.23367325,39.82798857]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.231","geometry":{"type":"Point","coordinates":[116.23365865,39.82818668]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.232","geometry":{"type":"Point","coordinates":[116.23364025,39.82843633]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.233","geometry":{"type":"Point","coordinates":[116.23364004,39.82843929]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.234","geometry":{"type":"Point","coordinates":[116.23362085,39.82869966]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.235","geometry":{"type":"Point","coordinates":[116.2335454,39.82972368]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.236","geometry":{"type":"Point","coordinates":[116.23354456,39.82973499]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.237","geometry":{"type":"Point","coordinates":[116.23353405,39.82987763]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.238","geometry":{"type":"Point","coordinates":[116.23332306,39.83031047]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.239","geometry":{"type":"Point","coordinates":[116.23332227,39.83031088]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.240","geometry":{"type":"Point","coordinates":[116.23313679,39.83040766]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.241","geometry":{"type":"Point","coordinates":[116.23269865,39.83063625]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.242","geometry":{"type":"Point","coordinates":[116.23267173,39.83065029]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.243","geometry":{"type":"Point","coordinates":[116.23259891,39.83068829]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.244","geometry":{"type":"Point","coordinates":[116.23234943,39.83081845]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.245","geometry":{"type":"Point","coordinates":[116.2322861,39.83085149]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.246","geometry":{"type":"Point","coordinates":[116.2319524,39.8310256]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.247","geometry":{"type":"Point","coordinates":[116.23133795,39.83134618]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.248","geometry":{"type":"Point","coordinates":[116.23085185,39.83159979]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.249","geometry":{"type":"Point","coordinates":[116.23047794,39.83179488]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.250","geometry":{"type":"Point","coordinates":[116.23041787,39.83182622]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.251","geometry":{"type":"Point","coordinates":[116.23041057,39.83183003]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.252","geometry":{"type":"Point","coordinates":[116.2301912,39.83194448]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.253","geometry":{"type":"Point","coordinates":[116.23016493,39.83195819]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.254","geometry":{"type":"Point","coordinates":[116.22992704,39.8320823]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.255","geometry":{"type":"Point","coordinates":[116.22977873,39.83215969]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.256","geometry":{"type":"Point","coordinates":[116.22955145,39.83227826]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.257","geometry":{"type":"Point","coordinates":[116.22900225,39.83226665]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.258","geometry":{"type":"Point","coordinates":[116.22887326,39.83203548]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.259","geometry":{"type":"Point","coordinates":[116.22885265,39.83199854]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.260","geometry":{"type":"Point","coordinates":[116.22859983,39.83154547]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.261","geometry":{"type":"Point","coordinates":[116.22852738,39.83141564]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.262","geometry":{"type":"Point","coordinates":[116.22818298,39.83079845]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.263","geometry":{"type":"Point","coordinates":[116.22807795,39.83061021]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.264","geometry":{"type":"Point","coordinates":[116.22787576,39.83024787]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.265","geometry":{"type":"Point","coordinates":[116.22782582,39.83015839]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.266","geometry":{"type":"Point","coordinates":[116.22772778,39.82998269]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.267","geometry":{"type":"Point","coordinates":[116.2276744,39.82988702]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.268","geometry":{"type":"Point","coordinates":[116.22764966,39.82984269]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.269","geometry":{"type":"Point","coordinates":[116.22752024,39.82961077]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.270","geometry":{"type":"Point","coordinates":[116.22751383,39.82959927]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.271","geometry":{"type":"Point","coordinates":[116.22741235,39.82941742]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.272","geometry":{"type":"Point","coordinates":[116.22696165,39.82860973]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.273","geometry":{"type":"Point","coordinates":[116.22693913,39.82856936]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.274","geometry":{"type":"Point","coordinates":[116.22693294,39.82855827]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.275","geometry":{"type":"Point","coordinates":[116.22691577,39.8285275]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.276","geometry":{"type":"Point","coordinates":[116.22677897,39.82828234]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.277","geometry":{"type":"Point","coordinates":[116.22668621,39.82811611]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.278","geometry":{"type":"Point","coordinates":[116.22654824,39.82786885]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.279","geometry":{"type":"Point","coordinates":[116.22642077,39.82764043]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.280","geometry":{"type":"Point","coordinates":[116.2262556,39.82734443]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.281","geometry":{"type":"Point","coordinates":[116.22615973,39.82717262]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.282","geometry":{"type":"Point","coordinates":[116.22611974,39.82710096]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.283","geometry":{"type":"Point","coordinates":[116.22602581,39.82693262]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.284","geometry":{"type":"Point","coordinates":[116.22600745,39.82689972]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.285","geometry":{"type":"Point","coordinates":[116.22591845,39.82674022]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.286","geometry":{"type":"Point","coordinates":[116.22573143,39.82640507]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.287","geometry":{"type":"Point","coordinates":[116.22572886,39.82640046]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.288","geometry":{"type":"Point","coordinates":[116.22533811,39.82570022]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.289","geometry":{"type":"Point","coordinates":[116.22532467,39.82567613]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.290","geometry":{"type":"Point","coordinates":[116.22527852,39.82559343]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.291","geometry":{"type":"Point","coordinates":[116.22511364,39.82529795]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.292","geometry":{"type":"Point","coordinates":[116.22510627,39.82528473]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.293","geometry":{"type":"Point","coordinates":[116.22498318,39.82506415]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.294","geometry":{"type":"Point","coordinates":[116.22493731,39.82498194]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.295","geometry":{"type":"Point","coordinates":[116.22477581,39.82469253]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.296","geometry":{"type":"Point","coordinates":[116.22466858,39.82450037]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.297","geometry":{"type":"Point","coordinates":[116.22462337,39.82441935]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.298","geometry":{"type":"Point","coordinates":[116.22446104,39.82412844]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.299","geometry":{"type":"Point","coordinates":[116.22442359,39.82406131]},"geometry_name":"the_geom","properties":{"CID":2}},{"type":"Feature","id":"randomPoint2.300","geometry":{"type":"Point","coordinates":[116.22435436,39.82393725]},"geometry_name":"the_geom","properties":{"CID":2}}],"totalFeatures":300,"numberMatched":300,"numberReturned":300,"timeStamp":"2019-03-13T02:16:54.604Z","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::4326"}}}')
            if (tag == 1) {
                //{type: "Feature", id: "randomPoint2.1", geometry: {…}, geometry_name: "the_geom", properties: {…}}
                cid0 = jsonObj.features.filter((e)=>{
                    return e.properties.CID == 0
                }
                )
            }
            if (tag == 2) {

                cid1 = jsonObj.features.filter((e)=>{
                    return e.properties.CID == 1
                }
                )
            }
            if (tag == 3) {
                cid2 = jsonObj.features.filter((e)=>{
                    return e.properties.CID == 2
                }
                )
            }
        }
        InstanPeopleFromJson(1);
        InstanPeopleFromJson(2);
        InstanPeopleFromJson(3);
        var interval, interval2, interval3;
        //开始演示
        $("#beginShow").click(()=>{
            //1  
            interval = setInterval(()=>{
                runPeopleMove(cid0, vector, 0, 1);
            }
            , 50)

            //2   
            interval2 = setInterval(()=>{
                runPeopleMove(cid1, vector2, 0, 2);
            }
            , 50)

            //     3  
            interval3 = setInterval(()=>{
                runPeopleMove(cid2, vector3, 0, 3);
            }
            , 50)

        }
        )
        var styleRed = new ol.style.Style({
            image: new ol.style.Icon(({
                src: 'img/red_man.png'
            }))
        });

        //是否在安全区内,用的是平面坐标
        function isInPoly(pt) {
            for (var i = 0; i < safeArea.getSource().getFeatures().length; i++) {
                //遍历安全区是否相交
                var poly = turf.polygon(safeArea.getSource().getFeatures()[i].getGeometry().getCoordinates()[0]);
                if (turf.booleanPointInPolygon(pt, poly)) {
                    return true;
                }
            }
            return false;
        }
        function renderWarning(vector, pointFeature, isSafe) {
            //如果危险,报警,1.点符号变  2.报警的亮
            if (!isSafe) {
                //人物变红
                pointFeature.setStyle(styleRed);
                //layer的人员变红
                $('#' + vector.values_.title).css('background', 'red')
                //警报灯亮
                $('#alertLightOn').show();
                $('#alertLightOff').hide();
            } else {
                //人物变蓝
                pointFeature.setStyle(styleBlue)
                $('#' + vector.values_.title).css('background', '')
                $('#alertLightOn').hide();
                $('#alertLightOff').show();
            }
        }
        //人员json，图层，从该人的第i位置开始模拟，哪个人
        function runPeopleMove(peoplePostionPath, vector, i, tag) {
            //人员位置路径用完了，清理模拟事件
            if (peoplePostionPath[i] == undefined) {
                if (tag == 3) {
                    clearInterval(interval3);
                }
                if (tag == 2) {
                    clearInterval(interval2);
                }
                if (tag == 1) {
                    clearInterval(interval);
                }
                InstanPeopleFromJson(tag);
            } else {
                //清理图层
                var x = peoplePostionPath[i].geometry.coordinates[0];
                var y = peoplePostionPath[i].geometry.coordinates[1];
                //用完删除,删除第一个
                peoplePostionPath.shift();

                //是否安全,地理分析
                var pt = turf.point(ol.proj.fromLonLat([x, y]));
                var isSafe = isInPoly(pt);

                //刷新人员位置
                var pointFeature = vector.getSource().getFeatures()[0];
                if (pointFeature == undefined)
                    return;
                pointFeature.getGeometry().setCoordinates(ol.proj.fromLonLat([x, y]));

                renderWarning(vector, pointFeature, isSafe)

            }
        }

    }

}
);
