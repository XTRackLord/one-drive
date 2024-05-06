COMPONENT('toast', 'timeout:8; position:top-right; loader:true; animate:fade', function (self, config) {
    self.singleton();
    self.readonly();
    self.template = Tangular.compile('<div class="ui-toast {{ type }}" data-id="{{ id }}" {{ if callback }} style="cursor:pointer"{{ fi }}>{{ if loader }}<div class="loader"></div>{{fi}}<i class="fa fa-times"></i><div class="ui-toast-icon">{{if icon }}<i class="fa {{ icon }}"></i>{{fi}}{{if img }}{{ img | raw }}{{fi}}</div><div class="ui-toast-message">{{if date }}<div class="ui-toast-datetime">{{ date }}</div>{{fi}}{{ mess | raw }}</div></div>');
    self.items = {};
    self.make = function () {
        self.aclass('ui-toast-container');
        let position = config.position || 'top-right';
        self.aclass(position);

        self.event('click', 'a,button', function (e) {
            e.stopPropagation();
        });

        self.event('click', '.ui-toast', function () {
            var el = $(this);
            var id = el.attr('data-id');
            var obj = self.items[id];
            self.close(obj.id);
        });
    };

    self.configure = function (key, value, init, prev) {
        if (init)
            return;
        if (key == 'position') {
            self.rclass();
            self.aclass('ui-toast-container ' + value);
        }
    }

    self.close = function (id) {
        var obj = self.items[id];
        if (obj.autoClose) clearTimeout(obj.autoClose);
        if (!obj) return;
        if (obj.callback) obj.callback(obj);
        obj.callback = null;
        delete self.items[id];
        if (config.animate == 'fade') {
            self.find('div[data-id="{0}"]'.format(id)).fadeOut('normal', function () { $(this).remove() });
        } else if (config.animate == 'slide') {
            self.find('div[data-id="{0}"]'.format(id)).slideUp('normal', function () { $(this).remove() });
        }
        else {
            self.find('div[data-id="{0}"]'.format(id)).remove();
        }
    };

    self.success = function (mess, o, callback) {
        self.append(mess, o, callback || null, 'success', 'check');
    };
    self.warning = function (mess, o, callback) {
        self.append(mess, o, callback || null, 'warning', 'exclamation-triangle');
    };
    self.error = function (mess, o, callback) {
        self.append(mess, o, callback || null, 'error', 'bell');
    };
    self.info = function (mess, o, callback) {
        self.append(mess, o, callback || null, 'info', 'info-circle');
    };

    self.append = function (mess, o, callback, tp, ic) {
        console.log(config);
        if (typeof (o) === 'function') {
            callback = o;
            o = null;
        }
        if (!o) o = {};
        o.type = o.type || tp || null;
        o.icon = o.icon || ic || null;
        let id = o.id || Math.floor(Math.random() * 100000);
        let type = (o.type) ? o.type : '';
        let icon = (o.icon) ? 'fa-' + o.icon : null;
        let img = (o.img) ? "<img class='img-rounded img-responsive' src='" + o.img + "'>" : null;
        let date = (o.date) ? o.date.format(config.format) : (config.dateAlways) ? new Date().format(config.format) : null;

        var obj = { id: id, type: type, icon: icon, img: img, mess: mess, date: date, callback: callback };
        obj.timeout = o.timeout || config.timeout;
        if (obj.timeout) obj.timeout *= 1000;
        obj.loader = o.loader || config.loader;
        self.items[obj.id] = obj;
        var elem = self.template(obj);
        self.element.append(elem);

        if (config.animate == 'fade') {
            self.element.find('.ui-toast:last').hide().fadeIn();
        } else if (config.animate == 'slide') {
            self.element.find('.ui-toast:last').hide().slideDown();
        }
        if (obj.loader) {
            self.updateLoader(obj);
        }
        if (obj.timeout) self.autoclose(obj);
    };

    self.updateLoader = function (obj) {
        var el = self.find('.ui-toast[data-id="' + obj.id + '"] .loader');
        var transitionTime = (obj.timeout / 1000) + 's';
        var style = '';
        style += '-webkit-transition: width ' + transitionTime + ' ease-in; \
                -o-transition: width ' + transitionTime + ' ease-in; \
                transition: width ' + transitionTime + ' ease-in; \
                background-color: #000; \
                opacity:.4;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=40);filter:alpha(opacity=40);';
        el.attr('style', style);
        setTimeout(function () { el.aclass('loaded'); }, 300);
    };

    self.autoclose = function (obj) {
        obj.autoClose = setTimeout(function () {
            self.close(obj.id);
        }, obj.timeout);
    };
})

//Test and example
var toast;
FIND('toast', function (comp) {
    toast = comp;
});

function example(e) {
    console.log(e);
    var str = [
        '<b>Title</b><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod'
    ];
    var ind = getRandom(2);
    var options = {};
    if (parseInt(e.data('day')) > -100) {
        options.date = new Date().add(e.data('day') + ' day');
    }

    if (e.data('icon')) {
        options.icon = e.data('icon');
    }

    if (e.data('img')) {
        options.img = '#';
    }

    if (e.data('timeout')) {
        options.timeout = e.data('timeout');
    }

    switch (e.data('type')) {
        case 'success': toast.success(str[ind], options); break;
        case 'warning': toast.warning(str[ind], options); break;
        case 'error': toast.error(str[ind], options); break;
        case 'info': toast.info(str[ind], options); break;
        default: toast.append(str[ind], options);
    }
}

function reconfigure(e) {
    if (e.data('position')) {
        RECONFIGURE('toast', { position: e.data('position') });
    }
    if (e.data('animate')) {
        RECONFIGURE('toast', { animate: e.data('animate') });
    }
    if (e.data('loader')) {
        var loader = (e.data('loader') == 'yes') ? true : false;
        RECONFIGURE('toast', { loader: loader });
    }
    if (e.data('timeout')) {
        RECONFIGURE('toast', { timeout: e.data('timeout') });
    }
}

function example_callback(e) {
    var str = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod';
    toast.error(str, { 'icon': 'battery-empty' }, function (res) {
        alert('Close notify - ' + res.mess);
    });
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}