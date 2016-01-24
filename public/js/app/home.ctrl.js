(function(){
    'use strict';
    angular.module('rhIcon')
        .controller('HomeCtrl', function($scope, CoreService, $state, $http, $timeout) {
            $.material.ripples();
            $scope.slogan = $("meta[name=slogan]").attr('content');

            $scope.init = function () {
                $scope.status = false;
                $scope.progress = 0;
                $scope.id = null;
                $scope.ready = false;
                $scope.sizes = [];
                $scope.presets = [{
                    length: 28,
                    icon: 'wechat',
                    selected: false
                }, {
                    length: 108,
                    icon: 'wechat',
                    selected: false
                }];
                $("#jumbotron_img").attr('src', '/img/launcher.png');
            };
            $scope.init();

            if (window.showAd) {
                $state.go('home.ad');
            }

            $("#platform").select2({
                minimumResultsForSearch: Infinity
            });

            var if_form = $("#if_form"),
                dom = if_form.get(0);
            dom.addEventListener("dragover", function(e){
                e.stopPropagation();
                e.preventDefault();

                if ($scope.status) {
                    return;
                }

                if_form.addClass('dropping');
            }, false);
            dom.addEventListener("dragleave", function(e){
                e.stopPropagation();
                e.preventDefault();

                if ($scope.status) {
                    return;
                }

                if_form.removeClass('dropping');
            }, false);
            dom.addEventListener("drop", function(e){
                e.stopPropagation();
                e.preventDefault();

                if ($scope.status) {
                    return;
                }

                if_form.removeClass('dropping');

                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                    $scope.$apply(function(){
                        $scope.startUploading(e.dataTransfer.files[0]);
                    });
                }
            }, false);

            $scope.uploadFromBtn = function () {
                $("#if").click();
            };

            $scope.selectedFile = function (that) {
                if (that.files && that.files.length) {
                    $scope.$apply(function(){
                        $scope.startUploading(that.files[0]);
                    });
                }
            };

            $scope.startUploading = function (file) {
                $scope.init();
                $scope.status = 'setting';

                var oFReader = new FileReader();
                oFReader.readAsDataURL(file);

                oFReader.onload = function (oFREvent) {
                    if (file.type != '' && file.type != 'image/vnd.adobe.photoshop') {
                        $("#jumbotron_img").get(0).src = oFREvent.target.result;
                    }
                };

                var formData = new FormData();
                formData.append('file', file);

                var oReq = new XMLHttpRequest();
                oReq.open("POST", "/icon/upload", true);
                oReq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                oReq.onreadystatechange = function() {
                    if (oReq.readyState == 4) {
                        if (oReq.status == 200) {
                            CoreService.resCallback(oReq.responseText, function(id){
                                $scope.$apply(function () {
                                    $scope.id = id;
                                    if ($scope.ready) {
                                        $scope.doGenerate();
                                    }
                                });
                            }, function() {
                                $scope.$apply(function () {
                                    $scope.init();
                                });

                                $("#jumbotron_img").get(0).src = 'img/launcher.png';
                            });
                        }
                    }
                };
                oReq.upload.onprogress = function(e) {
                    $scope.$apply(function () {
                        $scope.progress = Math.round(e.loaded / e.total * 100);
                    });
                };
                oReq.send(formData);
            };

            $scope.progressStyle = function () {
                return {
                    width: $scope.progress + '%'
                };
            };

            $scope.progressTipStyle = function () {
                return {
                    left: ($scope.progress - 1) + '%'
                };
            };

            $scope.generate = function () {
                if ($scope.id) {
                    $scope.doGenerate();
                } else {
                    $scope.ready = true;
                }
            };

            $scope.doGenerate = function () {
                $scope.status = 'generating';
                var sizes = $scope.sizes;
                angular.forEach($scope.presets, function (value, key) {
                    if (value.selected) {
                        sizes.push({
                            length: value.length
                        });
                    }
                });

                $http.post('/icon/generate', {
                    id: $scope.id,
                    platforms: $("#platform").val(),
                    sizes: sizes
                }).success(function(){
                    $state.go('icon', {
                        id: $scope.id
                    });
                });
            };

            $scope.addCustomSize = function () {
                $scope.sizes.push({
                    length: 0
                });
            };
        });
})();