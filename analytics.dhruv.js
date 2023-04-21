var analytics = new function () {
    var me = this;
	this.EmitAnalyticsData = function()
	{
    var analyticsClientCode = "";
	var analyticsDhruvProduct = "";
	var analyticsBkgno = "";
	var analyticsQuoteno = "";
	var myipaddress ="";
	if(document.getElementById("dhruv_analytics_accountcode"))
	{
	 analyticsClientCode = (document.getElementById("dhruv_analytics_accountcode").value || "");	
	}
    if(analyticsClientCode)
    {
		analyticsClientCode = ("0000000000" + analyticsClientCode).slice(-10);
    }
    if(analyticsClientCode && analyticsClientCode != "" && analyticsClientCode != "000000true")
	{
	
		$.getJSON('//api.ipify.org?format=jsonp&callback=?', function(data) { myipaddress =data.ip; });
		
		if(document.getElementById("dhruv_analytics_product"))
		{
		 analyticsDhruvProduct = (document.getElementById("dhruv_analytics_product").value || "");	
		}
		if(document.getElementById("dhruv_analytics_bkgno"))
		{
		 analyticsBkgno = (document.getElementById("dhruv_analytics_bkgno").value || "");	
		}
		if(document.getElementById("dhruv_analytics_quoteno"))
		{
		 analyticsQuoteno = (document.getElementById("dhruv_analytics_quoteno").value || "");	
		}
	
        var socket = io.connect('https://blacktomato-website-analytics.herokuapp.com:443');
        socket.on('connect', function () {
            var data = {
                accountcode: analyticsClientCode,
                url: window.location.href,
                date: "/Date(" + new Date().getTime() +")/",
                device: GetUserDeviceInfo() || "",
                os: GetOSName() || "",
                browser: GetBrowserName(GetOSName(), GetUserDeviceInfo()) || "",
                ip: myipaddress,
				dp: analyticsDhruvProduct,
				b: analyticsBkgno,
				q: analyticsQuoteno
            };
            
            socket.emit('analytics_msg', data);
            socket.disconnect();
        });        
    }

    function setCookie(cname,cvalue,exdays)
    {
        var d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        document.cookie = cname+"="+cvalue+"; "+expires+"; path=/";
    }
	function eraseCookie(name) {
		setCookie(name,"",-1);
	}
    function getCookie(cname)
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) 
          {
          var c = ca[i].trim();
          if (c.indexOf(name)==0) return c.substring(name.length,c.length);
          }
        return "";
    }
	
	function getUrlParameter (name)
	{
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    function GetBrowserName(osname, devicename) 
	{
        if (!isNullOrEmpty(osname) && osname == "MacOS" && devicename == "iPad") {
            if (navigator.userAgent.toLowerCase().indexOf("crios") != -1)
                return toTitleCase("chrome") + ' (' + navigator.userAgent.substr(navigator.userAgent.toLowerCase().lastIndexOf('crios/') + 6, navigator.userAgent.toLowerCase().indexOf('mobile/')-navigator.userAgent.toLowerCase().lastIndexOf('crios/')-7) + ')' || "";
            else if (navigator.userAgent.toLowerCase().indexOf("chrome") != -1)
                return toTitleCase("chrome") + ' (' + navigator.userAgent.substr(navigator.userAgent.toLowerCase().lastIndexOf('chrome/') + 6, navigator.userAgent.toLowerCase().indexOf('mobile/') - navigator.userAgent.toLowerCase().lastIndexOf('chrome/') - 7) + ')' || "";
            else if ($.browser.name)
                return toTitleCase($.browser.name) + ' (' + $.browser.version + ')' || "";
            else 
                "";
        }
        else if ($.browser.name)
            return toTitleCase($.browser.name) + ' (' + $.browser.version + ')' || "";
        else 
            return "";
    };

    function GetOSName() {
        var OSName = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

        return OSName;
    };
    function IsIPad() {
        var flag = false;
        if (navigator.userAgent.match(/iPad/i) != null)
            flag = true;
        else
            flag = false;

        return flag;
    };
    function GetCurrentDate() {
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var result = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + currentDate.getFullYear();
        return result;
    };
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }
    function GetUserDeviceInfo() {
        var device = navigator.userAgent.toLowerCase();
        var deviceName = "";

        if (/ipad/i.test(device)) {
            if (navigator.platform.indexOf("iPad") != -1) {
                deviceName = "iPad";
            }
        }

        if (/iphone/i.test(device)) {
            deviceName = "iPhone";
        }

        if (/ipod/i.test(device)) {
            deviceName = "iPod";
        }

        if (/android/i.test(device)) {
            deviceName = "Android";
        }

        if (/blackberry/i.test(device)) {
            deviceName = "Blackberry";
        }

        if (/webos/i.test(device)) {
            deviceName = "WebOS";
        }

        if (/windows phone/i.test(device)) {
            deviceName = "Windows Phone";
        }

        if (isNullOrEmpty(deviceName)) {
            deviceName = "Desktop";
        }

        return deviceName;
    };

    function isNullOrEmpty(value) {
        var isNullOrEmpty = true;
        if (value) {
            if (typeof (value) == 'string') {
                if (value.length > 0)
                    isNullOrEmpty = false;
            }
            else {
                // change for integer, float value
                isNullOrEmpty = false;
            }
        }
        return isNullOrEmpty;
    };
  }
}