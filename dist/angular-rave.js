(function () {
  'use strict'
  let defaultOptions = {
    key: '',
    isProduction: false
  }
  angular.module('ravepayment', [])
		.provider('$rave', function () {
		  function load_script (callback) {
		    let script = document.createElement('script') // use global document since Angular's $document is weak
		    if (script.readyState) {  // IE
		      script.onreadystatechange = function () {
		        if (script.readyState === 'loaded' || script.readyState === 'complete') {
		          script.onreadystatechange = null
		          callback()
		        }
		      }
		    } else {  // Others
		      script.onload = function () {
		        callback()
		      }
		    }
		    script.src = (!defaultOptions.isProduction)
							? 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/flwpbf-inline.js'
							: 'https://api.ravepay.co/flwv3-pug/getpaidx/api/flwpbf-inline.js'
		    document.body.appendChild(script)
		  }

  this.config = function (options) {
    angular.extend(defaultOptions, options)
  }
  this.$get = ['$q', function ($q) {
    let deferred = $q.defer()

    load_script(function () {
      deferred.resolve()
    })
    return deferred.promise
  }]
  return this
}).directive('ravePayButton', ['$rave', function ($rave) {
  let raveDirective = {}
  raveDirective.restrict = 'E'

  raveDirective.template = function (element, attribute) {
    return `<button class="rave-pay-button {{class}}">${attribute.text || 'Make Payment'}</button>`
  }

  raveDirective.scope = {
		class: '@',
	  email: '=',
	  amount: '=',
	  reference: '=',
	  callback: '=',
	  close: '=',
	  meta: '=?',
	  currency: '=?',
	  country: '=?',
	  customer_firstname: '=?',
	  customer_lastname: '=?',
	  customer_phone: '=?',
	  custom_title: '=?',
	  custom_description: '=?',
	  custom_logo: '=?',
	  redirectUrl: '=?',
	  inlineFrame: '=?'
  }

  raveDirective.link = function (scope, element, attrs) {
    $rave.then(function () {
	    element.bind('click', function () {
		    window.getpaidSetup({
			    customer_email: scope.email,
			    amount: scope.amount,
			    txref: scope.reference,
			    PBFPubKey: defaultOptions.key,
			    onclose: () => scope.close(),
			    callback: response => scope.callback(response),
			    meta: scope.meta,
			    currency: scope.currency || 'NGN',
			    country: scope.country || 'NG',
			    customer_firstname: scope.customer_firstname || '',
			    customer_lastname: scope.customer_lastname || '',
			    customer_phone: scope.customer_phone || '',
			    custom_title: scope.custom_title || '',
			    custom_description: scope.custom_description || '',
			    custom_logo: scope.custom_logo,
			    redirect_url: scope.redirectUrl || '',
			    force_inline_iframe: scope.inlineFrame || ''
		    })
	    });
    })
  }

  return raveDirective
}])
})()
