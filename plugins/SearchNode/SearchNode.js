var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SearchNodePlugIn = (function (_super) {
    __extends(SearchNodePlugIn, _super);
    function SearchNodePlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.ShortcutKeyPlugIn = new SearchWordKeyPlugIn(plugInManager);
    }
    return SearchNodePlugIn;
})(AssureIt.PlugInSet);

var SearchWordKeyPlugIn = (function (_super) {
    __extends(SearchWordKeyPlugIn, _super);
    function SearchWordKeyPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        this.HitNodes = [];
        this.FirstMove = false;
    }
    SearchWordKeyPlugIn.prototype.RegisterKeyEvents = function (caseViewer, Case0, serverApi) {
        var _this = this;
        this.caseViewer = caseViewer;
        this.HasStarted = false;
        this.CreateSearchWindow();
        $("body").keydown(function (e) {
            if (e.ctrlKey) {
                if (e.keyCode == 70) {
                    e.preventDefault();
                    $('nav').toggle();
                    if ($('nav').css('display') == 'block') {
                        _this.Start(caseViewer, Case0, serverApi);
                    } else {
                        _this.controllSearch = function (e) {
                        };
                        $('body').unbind("keydown", _this.controllSearch);
                        _this.Color(_this.HitNodes, caseViewer, "Default");
                        _this.HitNodes = [];
                        _this.HasStarted = false;
                    }
                }
            }
        });
        return true;
    };

    SearchWordKeyPlugIn.prototype.Start = function (caseViewer, Case0, serverApi) {
        var _this = this;
        $('.form-control').focus();
        $('.btn').click(function (ev) {
            ev.preventDefault();
            if (!_this.HasStarted) {
                _this.Search(caseViewer, Case0, serverApi);
                _this.HasStarted = true;
            } else {
                if ($('.form-control').val() != _this.Keyword) {
                    _this.FirstMove = true;
                    _this.Color(_this.HitNodes, caseViewer, "Default");
                    var Top = Case0.ElementTop;
                    var TopLabel = Top.Label;
                    var TopMap = caseViewer.ViewMap[TopLabel];
                    var TopHTML = TopMap.HTMLDoc;
                    var Screen = caseViewer.Screen;
                    var DestX = Screen.ConvertX(TopMap.AbsX, TopHTML);
                    var DestY = Screen.ConvertY(TopMap.AbsY, TopHTML);
                    _this.Move(DestX, DestY, 100, function () {
                    });
                    _this.HitNodes = [];
                    _this.Search(caseViewer, Case0, serverApi);
                    $('body').unbind("keydown", _this.controllSearch);
                    _this.controllSearch = null;
                    if (_this.HitNodes.length == 0) {
                        _this.HasStarted = false;
                    }
                }
            }
        });
    };

    SearchWordKeyPlugIn.prototype.Search = function (caseViewer, Case0, serverApi) {
        var _this = this;
        this.Keyword = $('.form-control').val();
        var nodeIndex = 0;
        var moveFlag = false;
        var TopNodeModel = Case0.ElementTop;

        if (this.Keyword == "") {
            return;
        }

        TopNodeModel.SearchNode(this.Keyword, this.HitNodes);

        if (this.HitNodes.length == 0) {
            return;
        }

        this.Color(this.HitNodes, caseViewer, "Search");
        var NodeLabel = this.HitNodes[nodeIndex].Label;
        var CaseMap = caseViewer.ViewMap[NodeLabel];
        var currentHTML = CaseMap.HTMLDoc;
        var screenManager = caseViewer.Screen;
        var NodePosX = CaseMap.AbsX;
        var NodePosY = CaseMap.AbsY;
        var destinationX = screenManager.ConvertX(NodePosX, currentHTML);
        var destinationY = screenManager.ConvertY(NodePosY, currentHTML);

        this.Move(destinationX, destinationY, 100, function () {
            _this.FirstMove = false;
        });
        CaseMap.SVGShape.EnableHighlight();

        this.controllSearch = function (e) {
            if (!e.shiftKey) {
                if (e.keyCode == 13) {
                    if (!moveFlag) {
                        if (_this.HitNodes.length == 1) {
                            return;
                        }
                        nodeIndex++;
                        if (nodeIndex == _this.HitNodes.length) {
                            nodeIndex = 0;
                        }

                        NodeLabel = _this.HitNodes[nodeIndex].Label;
                        CaseMap = caseViewer.ViewMap[NodeLabel];
                        NodePosX = CaseMap.AbsX;
                        NodePosY = CaseMap.AbsY;
                        currentHTML = CaseMap.HTMLDoc;
                        destinationX = screenManager.ConvertX(NodePosX, currentHTML);
                        destinationY = screenManager.ConvertY(NodePosY, currentHTML);

                        moveFlag = true;

                        _this.Move(destinationX, destinationY, 100, function () {
                            moveFlag = false;
                            if (nodeIndex == 0) {
                                caseViewer.ViewMap[_this.HitNodes[_this.HitNodes.length - 1].Label].SVGShape.SetColor(AssureIt.Color.Searched);
                                caseViewer.ViewMap[_this.HitNodes[_this.HitNodes.length - 1].Label].SVGShape.DisableHighlight();
                            } else {
                                caseViewer.ViewMap[_this.HitNodes[nodeIndex - 1].Label].SVGShape.SetColor(AssureIt.Color.Searched);
                                caseViewer.ViewMap[_this.HitNodes[nodeIndex - 1].Label].SVGShape.DisableHighlight();
                            }

                            if (!_this.FirstMove) {
                                CaseMap.SVGShape.EnableHighlight();
                            }
                        });
                    }
                }
            } else {
                if (e.keyCode == 13) {
                    if (!moveFlag) {
                        if (_this.HitNodes.length == 1) {
                            return;
                        }

                        nodeIndex--;
                        if (nodeIndex == -1) {
                            nodeIndex = _this.HitNodes.length - 1;
                        }

                        NodeLabel = _this.HitNodes[nodeIndex].Label;
                        CaseMap = caseViewer.ViewMap[NodeLabel];
                        NodePosX = CaseMap.AbsX;
                        NodePosY = CaseMap.AbsY;
                        currentHTML = CaseMap.HTMLDoc;
                        destinationX = screenManager.ConvertX(NodePosX, currentHTML);
                        destinationY = screenManager.ConvertY(NodePosY, currentHTML);

                        moveFlag = true;

                        _this.Move(destinationX, destinationY, 100, function () {
                            moveFlag = false;

                            if (nodeIndex == _this.HitNodes.length - 1) {
                                caseViewer.ViewMap[_this.HitNodes[0].Label].SVGShape.SetColor(AssureIt.Color.Searched);
                                caseViewer.ViewMap[_this.HitNodes[0].Label].SVGShape.DisableHighlight();
                            } else {
                                caseViewer.ViewMap[_this.HitNodes[nodeIndex + 1].Label].SVGShape.SetColor(AssureIt.Color.Searched);
                                caseViewer.ViewMap[_this.HitNodes[nodeIndex + 1].Label].SVGShape.DisableHighlight();
                            }
                            if (!_this.FirstMove) {
                                CaseMap.SVGShape.EnableHighlight();
                            }
                        });
                    }
                }
            }
        };
        $('body').keydown(this.controllSearch);
    };

    SearchWordKeyPlugIn.prototype.CreateSearchWindow = function () {
        $('<nav class="navbar pull-right" style="position: absolute"><form class="navbar-form" role="Search"><input type="text" class="form-control" placeholder="Search"/><input type="submit" value="search" class="btn"/></form></nav>').appendTo($('body'));

        $('nav').css({ display: 'none', width: '260px', margin: 0, height: '24px', top: '0', right: '0' });

        $('.navbar-form').css({ width: '230px', position: 'absolute' });

        $('.form-control').css({ width: '156px', position: 'absolute' });

        $('.btn').css({ position: 'absolute', left: '176px' });
    };

    SearchWordKeyPlugIn.prototype.Color = function (HitNodes, caseViewer, funcname) {
        switch (funcname) {
            case "Default":
                for (var i = 0; i < HitNodes.length; i++) {
                    var thisNodeLabel = HitNodes[i].Label;
                    caseViewer.ViewMap[thisNodeLabel].SVGShape.SetColor(AssureIt.Color.Default);
                }
                break;

            case "Search":
                for (var i = 0; i < HitNodes.length; i++) {
                    var thisNodeLabel = this.HitNodes[i].Label;
                    caseViewer.ViewMap[thisNodeLabel].SVGShape.SetColor(AssureIt.Color.Searched);
                }
                break;
        }
    };

    SearchWordKeyPlugIn.prototype.Move = function (logicalOffsetX, logicalOffsetY, duration, callback) {
        var cycle = 1000 / 30;
        var cycles = duration / cycle;
        var screenManager = this.caseViewer.Screen;
        var initialX = screenManager.GetOffsetX();
        var initialY = screenManager.GetOffsetY();

        var deltaX = (logicalOffsetX - initialX) / cycles;
        var deltaY = (logicalOffsetY - initialY) / cycles;

        var currentX = initialX;
        var currentY = initialY;
        var count = 0;

        var move = function () {
            if (count < cycles) {
                count += 1;
                currentX += deltaX;
                currentY += deltaY;
                screenManager.SetLogicalOffset(currentX, currentY, 1);
                setTimeout(move, cycle);
            } else {
                screenManager.SetLogicalOffset(logicalOffsetX, logicalOffsetY, 1);
                callback();
            }
        };
        move();
    };
    return SearchWordKeyPlugIn;
})(AssureIt.ShortcutKeyPlugIn);
