var AssureIt;
(function (AssureIt) {
    var SideMenuModel = (function () {
        function SideMenuModel(href, value, id, icon, callback) {
            this.href = href;
            this.value = value;
            this.id = id;
            this.icon = icon;
            this.callback = callback;
        }
        return SideMenuModel;
    })();
    AssureIt.SideMenuModel = SideMenuModel;

    var SideMenu = (function () {
        function SideMenu() {
        }
        SideMenu.Create = function (models) {
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                $("#drop-menu").prepend($('<li id="' + model.id + '"><a href="' + model.href + '"><span class="glyphicon ' + model.icon + '"></span>&nbsp; ' + model.value + '</a></li>'));
                $("#" + model.id).click(model.callback);
            }
        };
        return SideMenu;
    })();
    AssureIt.SideMenu = SideMenu;
})(AssureIt || (AssureIt = {}));
