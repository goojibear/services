/* Google Analytics instantiation*/
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	  
ga('create', 'UA-70127355-1', 'auto');
	  
/*! goojiCode v0.0.1 | (c) 2015 Goojibear */
var goojiCode = goojiCode || {};
goojiCode.consts = { 
	gbGetNumberBtn: '.gbGetNumberBtn',
	gbCallNumberBtn: '.gbCallNumberBtn',	
	gbCallNamberIFrameClass: 'gbCallNamberIFrameClass',
	gbRingPoolNumber: 'http://offers.loolimedia.com/promoNumber/promoNumber.html'
};

goojiCode.init = function(metaData){
	var self = this;
	this.metaData = metaData;	
	this.metaData.pageId = guid();	
	  
	ga('set', 'dimension1', this.metaData.advertiserName);
	ga('set', 'dimension2', this.metaData.publisherName);
	ga('set', 'dimension3', this.metaData.campaignName);
	ga('set', 'dimension4', this.metaData.landingPage);
	ga('send', 'pageview', this.metaData.pageName);
	
	var clickId = this.getPublisherClickId();
	this.metaData.clickId = clickId;
	if(!!clickId){
		ga('send', 'event', 'Publisher Click', clickId.toString(), this.metaData.campaignName, {
			nonInteraction: true
		});
	}	
	
	$(document).ready(function() {
		$.ajax({ 
		  url: '//freegeoip.net/json/', 
		  type: 'POST', 
		  dataType: 'jsonp',
		  success: function(location) {
			self.metaData.location = location;
			self.metaData.utcTimestamp = self.getUtcTimestamp();
			self.postData('pageTracking', self.metaData);	
		  },
		});		
	});
	function guid() {
	  function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	}
};

goojiCode.getPublisherClickId = function(){
	var lpQs = window.location.search;
	var baseUrl, clickId;
	if(lpQs.length > 1 && lpQs.indexOf('?') !== -1){		
		baseUrl = lpQs.substring(1);
		var queryParts = baseUrl.split('&');
		for(var i = 0; i < queryParts.length; i++){
			var items = queryParts[i].split('=');
			if(items[0] == 'clickid'){
				clickId = items[1];
			}
		}
	}
	return clickId;
};

goojiCode.appendUrlParams = function(selector, useGoojiAttr){
	var items = $(selector);
	for(var i = 0; i < items.length; i++){
		var elm = $(items[i]);
		var baseUrl = (!!useGoojiAttr) ? elm.attr("gooji-href") : elm.attr("href");
		if(baseUrl){
			if(baseUrl.length > 1) {
				var lpQs = window.location.search;
				if(baseUrl.indexOf('?') === -1){
					baseUrl +=  lpQs;
				} else {
					baseUrl += (lpQs.length > 0) ? '&' + lpQs.substring(1) : lpQs.substring(1);
				}

				if(!!useGoojiAttr){
					elm.attr("gooji-href", baseUrl);
				} else {
					elm.attr("href", baseUrl);
				}
			} else {
				console.error('The button was not set with a URL!');
			}
		}
	}	
};

goojiCode.bindGAToClick = function(selector, category, action, label, paramsMap){
	var self = this;
	$(selector).click(function() {
		if(ga){
			ga('set', 'dimension1', self.metaData.advertiserName);
			ga('set', 'dimension2', self.metaData.publisherName);
			ga('set', 'dimension3', self.metaData.campaignName);
			ga('set', 'dimension4', self.metaData.landingPage);
			if(paramsMap){
				ga('send', 'event', category, action, label, paramsMap);
			} else {
				ga('send', 'event', category, action, label);
			}			
		} else {
			console.error('GA was not implemented on this page!');
		}		
		
		var actualCampaignId = $(this).attr('gooji-campaign');
		if(!!actualCampaignId){
			self.metaData.campaignId = parseInt(actualCampaignId);
		}
		
		var actualPhoneNumber = $(this).attr('gooji-phone');
		if(!!actualPhoneNumber){
			self.metaData.promoNumber = actualPhoneNumber;
		}

        var redirectUrl = $(this).attr('gooji-href');
		self.metaData.utcTimestamp = self.getUtcTimestamp();		
		self.postData('clickTracking', self.metaData, redirectUrl);
	});
};

goojiCode.doGAToClick = function(selector, category, action, label, paramsMap){
	var self = this;	
	if(ga){
		ga('set', 'dimension1', self.metaData.advertiserName);
		ga('set', 'dimension2', self.metaData.publisherName);
		ga('set', 'dimension3', self.metaData.campaignName);
		ga('set', 'dimension4', self.metaData.landingPage);
		if(paramsMap){
			ga('send', 'event', category, action, label, paramsMap);
		} else {
			ga('send', 'event', category, action, label);
		}			
	} else {
		console.error('GA was not implemented on this page!');
	}		
	
	var actualCampaignId = $(selector).attr('gooji-campaign');
	if(!!actualCampaignId){
		self.metaData.campaignId = parseInt(actualCampaignId);
	}
	
	var actualPhoneNumber = $(selector).attr('gooji-phone');
	if(!!actualPhoneNumber){
		self.metaData.promoNumber = actualPhoneNumber;
	}

	var redirectUrl = $(selector).attr('gooji-href');
	self.metaData.utcTimestamp = self.getUtcTimestamp();		
	self.postData('clickTracking', self.metaData, redirectUrl);	
};

goojiCode.appendRingPoolFrame = function(parentSelector, pId, cId, src, cssClass){
	var lpQs = window.location.search;
	if(!cssClass) cssClass = this.consts.gbCallNamberIFrameClass;
	if(!src) src = this.consts.gbRingPoolNumber;
	if(src.indexOf('?') === -1) src += '?';
	src += 'pId=' + pId + '&cId=' + cId
	src += (lpQs.length > 1) ? '&' + lpQs.substring(1) : '';
	
	$('<iframe />').attr('src', src).attr('class', cssClass).appendTo(parentSelector); 
};

goojiCode.postData = function(resource, data, redirectUrl){
	$.ajax({
		 type: "POST",
		 url: "http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/" + resource,
		 data: JSON.stringify(data),
		 contentType: "application/json; charset=utf-8",
		 crossDomain: true,
		 dataType: "json"
	  })
	  .fail(function () {
          if(!!redirectUrl) window.location.href = redirectUrl;
      })
      .done(function () {
          if(!!redirectUrl) window.location.href = redirectUrl;
      });
};

goojiCode.rotateLandingPageByHours = function(start, end, diffFromUTC, altPage){
	var d = new Date();
    var n = d.getUTCHours() - diffFromUTC;
	if(n <= 0) n += 24;
	
	if(start < end){
		// start = 3, end = 14
		if(n < start || n > end){
			document.location = altPage + document.location.search;
		}
	} else {
		// start = 14, end = 3
		if(n < start && n > end){
			document.location = altPage + document.location.search;
		}
	}	
}

goojiCode.getUtcTimestamp = function(){	
	return Date.parse(new Date());
};