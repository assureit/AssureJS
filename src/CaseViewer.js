var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
document.createSVGElement = function (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
};

var AssureIt;
(function (AssureIt) {
    var HTMLDoc = (function () {
        function HTMLDoc() {
            this.Width = 0;
            this.Height = 0;
        }
        HTMLDoc.prototype.Render = function (Viewer, NodeModel) {
            if (this.DocBase != null) {
                this.DocBase.remove();
            }
            this.DocBase = $('<div>').css("position", "absolute").attr('id', NodeModel.Label);
            this.DocBase.append($('<h4>' + NodeModel.Label + '</h4>'));
            this.RawDocBase = this.DocBase[0];

            this.InvokePlugInHTMLRender(Viewer, NodeModel, this.DocBase);
            this.UpdateWidth(Viewer, NodeModel);
            this.Resize(Viewer, NodeModel);
        };

        HTMLDoc.prototype.UpdateWidth = function (Viewer, Source) {
            switch (Source.Type) {
                case AssureIt.NodeType.Goal:
                    this.RawDocBase.className = "node node-goal";
                    break;
                case AssureIt.NodeType.Context:
                    this.RawDocBase.className = "node node-context";
                    break;
                case AssureIt.NodeType.Strategy:
                    this.RawDocBase.className = "node node-strategy";
                    break;
                case AssureIt.NodeType.Evidence:
                default:
                    this.RawDocBase.className = "node node-evidence";
                    break;
            }
        };

        HTMLDoc.prototype.InvokePlugInHTMLRender = function (caseViewer, caseModel, DocBase) {
            var pluginMap = caseViewer.pluginManager.HTMLRenderPlugInMap;
            for (var key in pluginMap) {
                var render = caseViewer.GetPlugInHTMLRender(key);
                render(caseViewer, caseModel, DocBase);
            }
        };

        HTMLDoc.prototype.Resize = function (Viewer, Source) {
            this.Width = CaseViewer.ElementWidth;
            this.Height = this.RawDocBase ? this.RawDocBase.clientHeight : 0;
        };

        HTMLDoc.prototype.SetPosition = function (x, y) {
            this.RawDocBase.style.left = x + "px";
            this.RawDocBase.style.top = y + "px";
        };
        return HTMLDoc;
    })();
    AssureIt.HTMLDoc = HTMLDoc;

    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    AssureIt.Point = Point;

    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Top"] = 1] = "Top";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Bottom"] = 3] = "Bottom";
    })(AssureIt.Direction || (AssureIt.Direction = {}));
    var Direction = AssureIt.Direction;

    function ReverseDirection(Dir) {
        return (Dir + 2) & 3;
    }

    var SVGShape = (function () {
        function SVGShape() {
            this.ColorClassName = AssureIt.Color.Default;
        }
        SVGShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            this.ShapeGroup = document.createSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = document.createSVGElement("path");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            this.ArrowPath.setAttribute("fill", "none");
            this.ArrowPath.setAttribute("stroke", "gray");
            this.ArrowPath.setAttribute("d", "M0,0 C0,0 0,0 0,0");
        };

        SVGShape.prototype.GetSVG = function () {
            return this.ShapeGroup;
        };

        SVGShape.prototype.GetSVGPath = function () {
            return this.ArrowPath;
        };

        SVGShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            this.Width = HTMLDoc.Width;
            this.Height = HTMLDoc.Height;
        };

        SVGShape.prototype.SetPosition = function (x, y) {
            var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
            mat.e = x;
            mat.f = y;
        };

        SVGShape.prototype.SetArrowPosition = function (p1, p2, dir) {
            var start = this.ArrowPath.pathSegList.getItem(0);
            var curve = this.ArrowPath.pathSegList.getItem(1);
            start.x = p1.x;
            start.y = p1.y;
            curve.x = p2.x;
            curve.y = p2.y;
            if (dir == Direction.Bottom || dir == Direction.Top) {
                curve.x1 = (9 * p1.x + p2.x) / 10;
                curve.y1 = (p1.y + p2.y) / 2;
                curve.x2 = (9 * p2.x + p1.x) / 10;
                curve.y2 = (p1.y + p2.y) / 2;
            } else {
                curve.x1 = (p1.x + p2.x) / 2;
                curve.y1 = (9 * p1.y + p2.y) / 10;
                curve.x2 = (p1.x + p2.x) / 2;
                curve.y2 = (9 * p2.y + p1.y) / 10;
            }
        };

        SVGShape.prototype.SetArrowColorWhite = function (white) {
            if (white) {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            } else {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            }
        };

        SVGShape.prototype.SetColor = function (key) {
        };

        SVGShape.prototype.GetColor = function () {
            return null;
        };

        SVGShape.prototype.EnableHighlight = function () {
        };

        SVGShape.prototype.DisableHighlight = function () {
        };

        SVGShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case Direction.Right:
                    return new Point(this.Width, this.Height / 2);
                case Direction.Left:
                    return new Point(0, this.Height / 2);
                case Direction.Top:
                    return new Point(this.Width / 2, 0);
                case Direction.Bottom:
                    return new Point(this.Width / 2, this.Height);
                default:
                    return new Point(0, 0);
            }
        };
        return SVGShape;
    })();
    AssureIt.SVGShape = SVGShape;

    var GoalShape = (function (_super) {
        __extends(GoalShape, _super);
        function GoalShape() {
            _super.apply(this, arguments);
        }
        GoalShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect = document.createSVGElement("rect");
            this.BodyRect.setAttribute("class", this.ColorClassName);
            this.UndevelopedSymbol = document.createSVGElement("use");
            this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");

            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        GoalShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect.setAttribute("width", this.Width.toString());
            this.BodyRect.setAttribute("height", this.Height.toString());
        };

        GoalShape.prototype.SetColor = function (key) {
            this.BodyRect.setAttribute("class", key);
        };

        GoalShape.prototype.GetColor = function () {
            return this.BodyRect.getAttribute("class");
        };

        GoalShape.prototype.EnableHighlight = function () {
            var CurrentColor = this.GetColor();
            if (!CurrentColor.match(/-highlight/)) {
                this.BodyRect.removeAttribute("class");
                this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
            }
        };

        GoalShape.prototype.DisableHighlight = function () {
            var CurrentColor = this.GetColor();
            this.BodyRect.removeAttribute("class");
            this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
        };

        GoalShape.prototype.SetUndevelolpedSymbolPosition = function (point) {
            this.UndevelopedSymbol.setAttribute("x", point.x.toString());
            this.UndevelopedSymbol.setAttribute("y", point.y.toString());
        };
        return GoalShape;
    })(SVGShape);
    AssureIt.GoalShape = GoalShape;

    var ContextShape = (function (_super) {
        __extends(ContextShape, _super);
        function ContextShape() {
            _super.apply(this, arguments);
        }
        ContextShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect = document.createSVGElement("rect");
            this.BodyRect.setAttribute("class", this.ColorClassName);
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        ContextShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect.setAttribute("width", this.Width.toString());
            this.BodyRect.setAttribute("height", this.Height.toString());
        };

        ContextShape.prototype.SetColor = function (key) {
            this.BodyRect.setAttribute("class", key);
        };

        ContextShape.prototype.GetColor = function () {
            return this.BodyRect.getAttribute("class");
        };

        ContextShape.prototype.EnableHighlight = function () {
            var CurrentColor = this.GetColor();
            if (!CurrentColor.match(/-highlight/)) {
                this.BodyRect.removeAttribute("class");
                this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
            }
        };

        ContextShape.prototype.DisableHighlight = function () {
            var CurrentColor = this.GetColor();
            this.BodyRect.removeAttribute("class");
            this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
        };
        return ContextShape;
    })(SVGShape);
    AssureIt.ContextShape = ContextShape;

    var StrategyShape = (function (_super) {
        __extends(StrategyShape, _super);
        function StrategyShape() {
            _super.apply(this, arguments);
            this.delta = 20;
        }
        StrategyShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyPolygon = document.createSVGElement("polygon");
            this.BodyPolygon.setAttribute("class", this.ColorClassName);
            this.ShapeGroup.appendChild(this.BodyPolygon);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        StrategyShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + this.Width + ",0 " + (this.Width - this.delta) + "," + this.Height + " 0," + this.Height);
        };

        StrategyShape.prototype.SetColor = function (key) {
            this.BodyPolygon.setAttribute("class", key);
        };

        StrategyShape.prototype.GetColor = function () {
            return this.BodyPolygon.getAttribute("class");
        };

        StrategyShape.prototype.EnableHighlight = function () {
            var CurrentColor = this.GetColor();
            if (!CurrentColor.match(/-highlight/)) {
                this.BodyPolygon.removeAttribute("class");
                this.BodyPolygon.setAttribute("class", CurrentColor + "-highlight");
            }
        };

        StrategyShape.prototype.DisableHighlight = function () {
            var CurrentColor = this.GetColor();
            this.BodyPolygon.removeAttribute("class");
            this.BodyPolygon.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
        };

        StrategyShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case Direction.Right:
                    return new Point(this.Width - this.delta / 2, this.Height / 2);
                case Direction.Left:
                    return new Point(this.delta / 2, this.Height / 2);
                case Direction.Top:
                    return new Point(this.Width / 2, 0);
                case Direction.Bottom:
                    return new Point(this.Width / 2, this.Height);
            }
        };
        return StrategyShape;
    })(SVGShape);
    AssureIt.StrategyShape = StrategyShape;

    var EvidenceShape = (function (_super) {
        __extends(EvidenceShape, _super);
        function EvidenceShape() {
            _super.apply(this, arguments);
        }
        EvidenceShape.prototype.Render = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Render.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyEllipse = document.createSVGElement("ellipse");
            this.BodyEllipse.setAttribute("class", this.ColorClassName);
            this.ShapeGroup.appendChild(this.BodyEllipse);
            this.Resize(CaseViewer, NodeModel, HTMLDoc);
        };

        EvidenceShape.prototype.Resize = function (CaseViewer, NodeModel, HTMLDoc) {
            _super.prototype.Resize.call(this, CaseViewer, NodeModel, HTMLDoc);
            this.BodyEllipse.setAttribute("cx", (this.Width / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.Height / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.Width / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.Height / 2).toString());
        };

        EvidenceShape.prototype.SetColor = function (key) {
            this.BodyEllipse.setAttribute("class", key);
        };

        EvidenceShape.prototype.GetColor = function () {
            return this.BodyEllipse.getAttribute("class");
        };

        EvidenceShape.prototype.EnableHighlight = function () {
            var CurrentColor = this.GetColor();
            if (!CurrentColor.match(/-highlight/)) {
                this.BodyEllipse.removeAttribute("class");
                this.BodyEllipse.setAttribute("class", CurrentColor + "-highlight");
            }
        };

        EvidenceShape.prototype.DisableHighlight = function () {
            var CurrentColor = this.GetColor();
            this.BodyEllipse.removeAttribute("class");
            this.BodyEllipse.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
        };
        return EvidenceShape;
    })(SVGShape);
    AssureIt.EvidenceShape = EvidenceShape;

    var SVGShapeFactory = (function () {
        function SVGShapeFactory() {
        }
        SVGShapeFactory.Create = function (Type) {
            switch (Type) {
                case AssureIt.NodeType.Goal:
                    return new GoalShape();
                case AssureIt.NodeType.Context:
                    return new ContextShape();
                case AssureIt.NodeType.Strategy:
                    return new StrategyShape();
                case AssureIt.NodeType.Evidence:
                    return new EvidenceShape();
            }
        };
        return SVGShapeFactory;
    })();
    AssureIt.SVGShapeFactory = SVGShapeFactory;

    var NodeView = (function () {
        function NodeView(CaseViewer, NodeModel) {
            this.IsArrowWhite = false;
            this.AbsX = 0;
            this.AbsY = 0;
            this.x = 0;
            this.y = 0;
            this.CaseViewer = CaseViewer;
            this.Source = NodeModel;
            this.HTMLDoc = new HTMLDoc();
            this.HTMLDoc.Render(CaseViewer, NodeModel);
            this.SVGShape = SVGShapeFactory.Create(NodeModel.Type);
            this.SVGShape.Render(CaseViewer, NodeModel, this.HTMLDoc);
            this.TemporaryColor = null;
        }
        NodeView.prototype.Resize = function () {
            this.HTMLDoc.Resize(this.CaseViewer, this.Source);
            this.SVGShape.Resize(this.CaseViewer, this.Source, this.HTMLDoc);
        };

        NodeView.prototype.Update = function () {
            this.Resize();
            this.HTMLDoc.SetPosition(this.AbsX, this.AbsY);
            this.SVGShape.SetPosition(this.AbsX, this.AbsY);
            if (this.ParentShape != null) {
                this.SVGShape.SetArrowColorWhite(this.IsArrowWhite);
            }
        };

        NodeView.prototype.AppendHTMLElement = function (svgroot, divroot, caseViewer) {
            divroot.appendChild(this.HTMLDoc.RawDocBase);
            svgroot.appendChild(this.SVGShape.ShapeGroup);
            this.InvokePlugInSVGRender(caseViewer);

            if (this.ParentShape != null) {
                svgroot.appendChild(this.SVGShape.ArrowPath);
            }
            if (this.Source.Type == AssureIt.NodeType.Goal && this.Source.Children.length == 0) {
                svgroot.appendChild((this.SVGShape).UndevelopedSymbol);
            }
            this.Update();
        };

        NodeView.prototype.AppendHTMLElementRecursive = function (svgroot, divroot, caseViewer) {
            var Children = this.Source.Children;
            var ViewMap = this.CaseViewer.ViewMap;
            for (var i = 0; i < Children.length; i++) {
                ViewMap[Children[i].Label].AppendHTMLElementRecursive(svgroot, divroot, caseViewer);
            }
            this.AppendHTMLElement(svgroot, divroot, caseViewer);
        };

        NodeView.prototype.DeleteHTMLElement = function (svgroot, divroot) {
            this.HTMLDoc.DocBase.remove();
            $(this.SVGShape.ShapeGroup).remove();
            if (this.ParentShape != null)
                $(this.SVGShape.ArrowPath).remove();
            this.Update();
        };

        NodeView.prototype.DeleteHTMLElementRecursive = function (svgroot, divroot) {
            var Children = this.Source.Children;
            var ViewMap = this.CaseViewer.ViewMap;
            for (var i = 0; i < Children.length; i++) {
                ViewMap[Children[i].Label].DeleteHTMLElementRecursive(svgroot, divroot);
            }
            this.DeleteHTMLElement(svgroot, divroot);
        };

        NodeView.prototype.GetAbsoluteConnectorPosition = function (Dir) {
            var p = this.SVGShape.GetConnectorPosition(Dir);
            p.x += this.AbsX;
            p.y += this.AbsY;
            return p;
        };

        NodeView.prototype.InvokePlugInSVGRender = function (caseViewer) {
            var pluginMap = caseViewer.pluginManager.SVGRenderPlugInMap;
            for (var key in pluginMap) {
                var render = caseViewer.GetPlugInSVGRender(key);
                render(caseViewer, this);
            }
        };

        NodeView.prototype.SetArrowPosition = function (p1, p2, dir) {
            this.SVGShape.SetArrowPosition(p1, p2, dir);
        };

        NodeView.prototype.SetTemporaryColor = function (fill, stroke) {
            if ((!fill || fill == "none") && (!stroke || stroke == "none")) {
                this.TemporaryColor = null;
            } else {
                this.TemporaryColor = { "fill": fill, "stroke": stroke };
            }
        };

        NodeView.prototype.GetTemporaryColor = function () {
            return this.TemporaryColor;
        };
        return NodeView;
    })();
    AssureIt.NodeView = NodeView;

    var CaseViewer = (function () {
        function CaseViewer(Source, pluginManager, serverApi, Screen) {
            this.Source = Source;
            this.pluginManager = pluginManager;
            this.serverApi = serverApi;
            this.Screen = Screen;
            this.InitViewMap(Source);
            this.Resize();
        }
        CaseViewer.prototype.InitViewMap = function (Source) {
            this.ViewMap = {};
            for (var elementkey in Source.ElementMap) {
                var element = Source.ElementMap[elementkey];
                this.ViewMap[element.Label] = new NodeView(this, element);
                if (element.Parent != null) {
                    this.ViewMap[element.Label].ParentShape = this.ViewMap[element.Parent.Label];
                }
            }
            this.ElementTop = Source.ElementTop;
        };

        CaseViewer.prototype.GetPlugInHTMLRender = function (PlugInName) {
            var _this = this;
            return function (viewer, model, e) {
                return _this.pluginManager.HTMLRenderPlugInMap[PlugInName].Delegate(viewer, model, e);
            };
        };

        CaseViewer.prototype.GetPlugInSVGRender = function (PlugInName) {
            var _this = this;
            return function (viewer, shape) {
                return _this.pluginManager.SVGRenderPlugInMap[PlugInName].Delegate(viewer, shape);
            };
        };

        CaseViewer.prototype.Resize = function () {
            for (var shapekey in this.ViewMap) {
                this.ViewMap[shapekey].Resize();
            }
            this.LayoutElement();
        };

        CaseViewer.prototype.Update = function () {
            this.Resize();
            for (var shapekey in this.ViewMap) {
                this.ViewMap[shapekey].Update();
            }
        };

        CaseViewer.prototype.DeleteViewsRecursive = function (root) {
            var Children = root.Source.Children;
            this.ViewMap[root.Source.Label].DeleteHTMLElementRecursive(null, null);
            delete this.ViewMap[root.Source.Label];
            for (var i = 0; i < Children.length; i++) {
                this.DeleteViewsRecursive(this.ViewMap[Children[i].Label]);
            }
        };

        CaseViewer.prototype.LayoutElement = function () {
            var layout = this.pluginManager.GetLayoutEngine();
            layout.Init(this.ViewMap, this.ElementTop, 0, 0, CaseViewer.ElementWidth);
            layout.LayoutAllView(this.ElementTop, 0, 0);
        };

        CaseViewer.prototype.UpdateViewMapRecursive = function (model, view) {
            for (var i in model.Children) {
                var child_model = model.Children[i];
                var child_view = this.ViewMap[child_model.Label];
                if (child_view == null) {
                    child_view = new NodeView(this, child_model);
                    this.ViewMap[child_model.Label] = child_view;
                    child_view.ParentShape = view;
                }
                this.UpdateViewMapRecursive(child_model, child_view);
            }
        };

        CaseViewer.prototype.UpdateViewMap = function () {
            this.UpdateViewMapRecursive(this.ElementTop, this.ViewMap[this.ElementTop.Label]);
        };

        CaseViewer.prototype.Draw = function () {
            this.UpdateViewMap();
            var divfrag = document.createDocumentFragment();
            var svgfrag = document.createDocumentFragment();
            this.ViewMap[this.ElementTop.Label].AppendHTMLElementRecursive(svgfrag, divfrag, this);
            this.Screen.ShapeLayer.appendChild(svgfrag);
            this.Screen.ContentLayer.appendChild(divfrag);
            this.pluginManager.RegisterActionEventListeners(this, this.Source, this.serverApi);
            this.Update();
        };

        CaseViewer.prototype.DeleteHTMLElementAll = function () {
            $('#layer0').children().remove();
            $('#layer1').children().remove();
        };
        CaseViewer.ElementWidth = 250;
        return CaseViewer;
    })();
    AssureIt.CaseViewer = CaseViewer;

    var ScrollManager = (function () {
        function ScrollManager() {
            this.InitialOffsetX = 0;
            this.InitialOffsetY = 0;
            this.InitialX = 0;
            this.InitialY = 0;
            this.CurrentX = 0;
            this.CurrentY = 0;
            this.Dx = 0;
            this.Dy = 0;
            this.MainPointerID = null;
            this.Pointers = [];
            this.timer = 0;
            this.ANIMATE_THRESHOLD = 5;
            this.SPEED_MAX = 100;
        }
        ScrollManager.prototype.SetInitialOffset = function (InitialOffsetX, InitialOffsetY) {
            this.InitialOffsetX = InitialOffsetX;
            this.InitialOffsetY = InitialOffsetY;
        };

        ScrollManager.prototype.StartDrag = function (InitialX, InitialY) {
            this.InitialX = InitialX;
            this.InitialY = InitialY;
            this.CurrentX = InitialX;
            this.CurrentY = InitialY;
        };

        ScrollManager.prototype.UpdateDrag = function (CurrentX, CurrentY) {
            this.Dx = CurrentX - this.CurrentX;
            this.Dy = CurrentY - this.CurrentY;
            var speed = this.Dx * this.Dx + this.Dy + this.Dy;
            if (speed > this.SPEED_MAX * this.SPEED_MAX) {
                this.Dx *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
                this.Dy *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
            }
            this.CurrentX = CurrentX;
            this.CurrentY = CurrentY;
        };

        ScrollManager.prototype.CalcOffsetX = function () {
            return this.CurrentX - this.InitialX + this.InitialOffsetX;
        };

        ScrollManager.prototype.CalcOffsetY = function () {
            return this.CurrentY - this.InitialY + this.InitialOffsetY;
        };

        ScrollManager.prototype.GetMainPointer = function () {
            for (var i = 0; i < this.Pointers.length; ++i) {
                if (this.Pointers[i].identifier === this.MainPointerID) {
                    return this.Pointers[i];
                }
            }
            ;
            return null;
        };

        ScrollManager.prototype.IsDragging = function () {
            return this.MainPointerID != null;
        };

        ScrollManager.prototype.StopAnimation = function () {
            clearInterval(this.timer);
            this.Dx = 0;
            this.Dy = 0;
        };

        ScrollManager.prototype.OnPointerEvent = function (e, Screen) {
            var _this = this;
            this.Pointers = e.getPointerList();
            if (this.Pointers.length > 0) {
                if (this.IsDragging()) {
                    var mainPointer = this.GetMainPointer();
                    if (mainPointer) {
                        this.UpdateDrag(mainPointer.pageX, mainPointer.pageY);
                        Screen.SetOffset(this.CalcOffsetX(), this.CalcOffsetY());
                    } else {
                        this.MainPointerID = null;
                    }
                } else {
                    this.StopAnimation();
                    this.timer = null;
                    var mainPointer = this.Pointers[0];
                    this.MainPointerID = mainPointer.identifier;
                    this.SetInitialOffset(Screen.GetOffsetX(), Screen.GetOffsetY());
                    this.StartDrag(mainPointer.pageX, mainPointer.pageY);
                }
            } else {
                if (this.IsDragging()) {
                    if (this.timer) {
                        this.StopAnimation();
                        this.timer = null;
                    }
                    this.timer = setInterval(function () {
                        if (Math.abs(_this.Dx) < _this.ANIMATE_THRESHOLD && Math.abs(_this.Dy) < _this.ANIMATE_THRESHOLD) {
                            _this.StopAnimation();
                        }
                        _this.CurrentX += _this.Dx;
                        _this.CurrentY += _this.Dy;
                        _this.Dx *= 0.95;
                        _this.Dy *= 0.95;
                        Screen.SetOffset(_this.CalcOffsetX(), _this.CalcOffsetY());
                    }, 16);
                }
                this.MainPointerID = null;
            }
        };

        ScrollManager.prototype.OnDoubleTap = function (e, Screen) {
            var width = Screen.ContentLayer.clientWidth;
            var height = Screen.ContentLayer.clientHeight;
            var pointer = this.Pointers[0];
        };
        return ScrollManager;
    })();
    AssureIt.ScrollManager = ScrollManager;

    var ScreenManager = (function () {
        function ScreenManager(ShapeLayer, ContentLayer, ControlLayer, BackGroundLayer) {
            var _this = this;
            this.ShapeLayer = ShapeLayer;
            this.ContentLayer = ContentLayer;
            this.ControlLayer = ControlLayer;
            this.BackGroundLayer = BackGroundLayer;
            this.ScrollManager = new ScrollManager();
            this.OffsetX = 0;
            this.OffsetY = 0;
            this.LogicalOffsetX = 0;
            this.LogicalOffsetY = 0;
            this.Scale = 1;
            this.ContentLayer.style["transformOrigin"] = "left top";
            this.ContentLayer.style["MozTransformOrigin"] = "left top";
            this.ContentLayer.style["msTransformOrigin"] = "left top";
            this.ContentLayer.style["OTransformOrigin"] = "left top";
            this.ContentLayer.style["webkitTransformOrigin"] = "left top";
            this.ControlLayer.style["transformOrigin"] = "left top";
            this.ControlLayer.style["MozTransformOrigin"] = "left top";
            this.ControlLayer.style["msTransformOrigin"] = "left top";
            this.ControlLayer.style["OTransformOrigin"] = "left top";
            this.ControlLayer.style["webkitTransformOrigin"] = "left top";
            this.UpdateAttr();
            var OnPointer = function (e) {
                _this.ScrollManager.OnPointerEvent(e, _this);
            };
            BackGroundLayer.addEventListener("pointerdown", OnPointer, false);
            BackGroundLayer.addEventListener("pointermove", OnPointer, false);
            BackGroundLayer.addEventListener("pointerup", OnPointer, false);
            BackGroundLayer.addEventListener("gesturedoubletap", function (e) {
                _this.ScrollManager.OnDoubleTap(e, _this);
            }, false);
            ContentLayer.addEventListener("pointerdown", OnPointer, false);
            ContentLayer.addEventListener("pointermove", OnPointer, false);
            ContentLayer.addEventListener("pointerup", OnPointer, false);
            ContentLayer.addEventListener("gesturedoubletap", function (e) {
                _this.ScrollManager.OnDoubleTap(e, _this);
            }, false);
        }
        ScreenManager.translateA = function (x, y) {
            return "translate(" + x + " " + y + ") ";
        };

        ScreenManager.scaleA = function (scale) {
            return "scale(" + scale + ") ";
        };

        ScreenManager.translateS = function (x, y) {
            return "translate(" + x + "px, " + y + "px) ";
        };

        ScreenManager.scaleS = function (scale) {
            return "scale(" + scale + ") ";
        };

        ScreenManager.prototype.UpdateAttr = function () {
            var attr = ScreenManager.translateA(this.OffsetX, this.OffsetY) + ScreenManager.scaleA(this.Scale);
            var style = ScreenManager.translateS(this.OffsetX, this.OffsetY) + ScreenManager.scaleS(this.Scale);
            this.ShapeLayer.setAttribute("transform", attr);
            this.ContentLayer.style["transform"] = style;
            this.ContentLayer.style["MozTransform"] = style;
            this.ContentLayer.style["webkitTransform"] = style;
            this.ContentLayer.style["msTransform"] = style;
            this.ContentLayer.style["OTransform"] = style;
            this.ControlLayer.style["transform"] = style;
            this.ControlLayer.style["MozTransform"] = style;
            this.ControlLayer.style["webkitTransform"] = style;
            this.ControlLayer.style["msTransform"] = style;
            this.ControlLayer.style["OTransform"] = style;
        };

        ScreenManager.prototype.SetScale = function (scale) {
            this.Scale = scale;
            var cx = this.GetPageCenterX();
            var cy = this.GetPageCenterY();
            this.OffsetX = (this.LogicalOffsetX - cx) * scale + cx;
            this.OffsetY = (this.LogicalOffsetY - cy) * scale + cy;
            this.UpdateAttr();
        };

        ScreenManager.prototype.SetOffset = function (x, y) {
            this.OffsetX = x;
            this.OffsetY = y;
            this.LogicalOffsetX = this.CalcLogicalOffsetX(x);
            this.LogicalOffsetY = this.CalcLogicalOffsetY(y);
            this.UpdateAttr();
        };

        ScreenManager.prototype.SetLogicalOffset = function (x, y, scale) {
            this.LogicalOffsetX = x;
            this.LogicalOffsetY = y;
            this.SetScale(scale || this.Scale);
        };

        ScreenManager.prototype.GetLogicalOffsetX = function () {
            return this.LogicalOffsetX;
        };

        ScreenManager.prototype.GetLogicalOffsetY = function () {
            return this.LogicalOffsetY;
        };

        ScreenManager.prototype.CalcLogicalOffsetX = function (OffsetX) {
            var cx = this.GetPageCenterX();
            return (OffsetX - cx) / this.Scale + cx;
        };

        ScreenManager.prototype.CalcLogicalOffsetY = function (OffsetY) {
            var cy = this.GetPageCenterY();
            return (OffsetY - cy) / this.Scale + cy;
        };

        ScreenManager.prototype.CalcLogicalOffsetXFromPageX = function (PageX) {
            return this.GetLogicalOffsetX() - (PageX - this.GetPageCenterX()) / this.Scale;
        };

        ScreenManager.prototype.CalcLogicalOffsetYFromPageY = function (PageY) {
            return this.GetLogicalOffsetY() - (PageY - this.GetPageCenterY()) / this.Scale;
        };

        ScreenManager.prototype.GetOffsetX = function () {
            return this.OffsetX;
        };

        ScreenManager.prototype.GetOffsetY = function () {
            return this.OffsetY;
        };

        ScreenManager.prototype.GetWidth = function () {
            return document.body.clientWidth;
        };

        ScreenManager.prototype.GetHeight = function () {
            return document.body.clientHeight;
        };

        ScreenManager.prototype.GetPageCenterX = function () {
            return this.GetWidth() / 2;
        };

        ScreenManager.prototype.GetPageCenterY = function () {
            return this.GetHeight() / 2;
        };

        ScreenManager.prototype.GetCaseWidth = function () {
            return $("#layer0")[0].getBoundingClientRect().width;
        };

        ScreenManager.prototype.GetCaseHeight = function () {
            return $("#layer0")[0].getBoundingClientRect().height;
        };

        ScreenManager.prototype.GetScale = function () {
            return this.Scale;
        };

        ScreenManager.prototype.GetScaleRate = function () {
            var svgwidth = this.GetCaseWidth();
            var svgheight = this.GetCaseHeight();
            var bodywidth = this.GetWidth();
            var bodyheight = this.GetHeight();
            var scaleWidth = bodywidth / svgwidth;
            var scaleHeight = bodyheight / svgheight;
            return Math.min(scaleWidth, scaleHeight);
        };

        ScreenManager.prototype.SetCaseCenter = function (DCaseX, DCaseY, HTMLDoc) {
            var NewOffsetX = this.ConvertX(DCaseX, HTMLDoc);
            var NewOffsetY = this.ConvertY(DCaseY, HTMLDoc);
            this.SetOffset(NewOffsetX, NewOffsetY);
        };

        ScreenManager.prototype.ConvertX = function (DCaseX, HTMLDoc) {
            var ConvertedX = this.OffsetX + (this.GetPageCenterX() - (this.OffsetX + DCaseX)) - HTMLDoc.Width / 2;
            return ConvertedX;
        };

        ScreenManager.prototype.ConvertY = function (DCaseY, HTMLDoc) {
            var ConvertedY = this.OffsetY + (this.GetPageCenterY() - (this.OffsetY + DCaseY)) - HTMLDoc.Height / 2;
            return ConvertedY;
        };
        return ScreenManager;
    })();
    AssureIt.ScreenManager = ScreenManager;
})(AssureIt || (AssureIt = {}));
