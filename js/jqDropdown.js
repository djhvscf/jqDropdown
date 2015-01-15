 /**
 * jqDropdown.js
 * @version: v1.0.0
 * @author: Dennis Hernández
 * @webSite: http://djhvscf.github.io/Blog
 *
 * Created by Dennis Hernández on 06/Jan/2015.
 * Inspired by Codrops http://www.codrops.com (http://tympanus.net/Development/SimpleDropDownEffects/index.html)
 *
 * Copyright (c) 2014 Dennis Hernández http://djhvscf.github.io/Blog
 *	
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
 
 
 
;( function( $, window, undefined ) {

	'use strict';

	$.jqDropdown = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	$.jqDropdown.themes = {};
	
	// the options
	$.jqDropdown.defaults = {
		// speed showing the elements
		speed : 300,
		// effects when the elements are opening
		easing : 'ease',
		// space between elements
		gutter : 0,
		// initial stack effect
		stack : false,
		// delay between each option animation
		delay : 0,
		// random angle and positions for the options
		random : false,
		// effect to slide in the options. value is the margin to start with
		slidingIn : false,
		// if you want to get the element selected
		onOptionSelect : $.noop,
		// if you want to get the open event
		onDropdownOpened : $.noop,
		// if you want to get the close event
		onDropdownClosed : $.noop,
		// delete the default option like 'Select an option'
		deleteDefaultOption : false,
		// theme to apply
		theme : 'blueTheme',
	};

	$.jqDropdown.prototype = {

		_init : function( options ) {
			this.$el.attr( 'name', 'cd-dropdown' ).attr( 'class', 'cd-select' );
			this.options = $.extend( true, {}, $.jqDropdown.defaults, options );
			this._initTheme();
			this._layout();
			this._initEvents();
		},
		_initTheme : function() {
			if($.jqDropdown.themes[this.options.theme]) {
				$.jqDropdown.themes[this.options.theme].init(this._requiredStyle);
			} else {
                throw Error ('Theme is not valid');
			}
		},
		_layout : function() {
			var self = this;
			this.minZIndex = 1000;
			var value = this._transformSelect();
			this.opts = this.listopts.children( 'li' );
			this.optsCount = this.opts.length;
			this.size = { width : this.dd.width(), height : this.dd.height() };
			
			var elName = this.$el.attr( 'name' ), elId = this.$el.attr( 'id' ),
				inputName = elName !== undefined ? elName : elId !== undefined ? elId : 'cd-dropdown-' + ( new Date() ).getTime();

			this.inputEl = $( '<input type="hidden" name="' + inputName + '" value="' + value + '"></input>' ).insertAfter( this.selectlabel );
			
			this.selectlabel.css( 'z-index', this.minZIndex + this.optsCount );
			this._positionOpts();
			if( Modernizr.csstransitions ) {
				setTimeout( function() { self.opts.css( 'transition', 'all ' + self.options.speed + 'ms ' + self.options.easing ); }, 25 );
			}

		},
		_transformSelect : function() {
			var optshtml = '', 
				selectlabel = '', 
				value = -1,
				self = this;
			
			this.$el.children( 'option' ).each( function() {
				var $this = $( this ),
					val = isNaN( $this.attr( 'value' ) ) ? $this.attr( 'value' ) : Number( $this.attr( 'value' ) ) ,
					classes = $this.attr( 'class' ),
					selected = $this.attr( 'selected' ),
					label = $this.text();

				if ( val !== -1 ) { //Not default option
					optshtml += self._createliElement( classes, val, label );
				} else if ( !self.options.deleteDefaultOption ) { //Deletes the default option
					optshtml += self._createliElement( classes, val, label );
				}

				if( selected ) {
					selectlabel = label;
					value = val;
				}

			} );

			this.listopts = $( '<ul/>' ).append( optshtml );
			this.selectlabel = $( '<span/>' ).append( selectlabel );
			this.dd = $( '<div class="cd-dropdown"/>' ).append( this.selectlabel, this.listopts ).insertAfter( this.$el );
			this.$el.remove();

			return value;

		},
		_positionOpts : function( anim ) {
			var self = this;

			this.listopts.css( 'height', 'auto' );
			this.opts
				.each( function( i ) {
					$( this ).css( {
						zIndex : self.minZIndex + self.optsCount - 1 - i,
						top : self.options.slidingIn ? ( i + 1 ) * ( self.size.height + self.options.gutter ) : 0,
						left : 0,
						marginLeft : self.options.slidingIn ? i % 2 === 0 ? self.options.slidingIn : - self.options.slidingIn : 0,
						opacity : self.options.slidingIn ? 0 : 1,
						transform : 'none'
					} );
				} );

			if( !this.options.slidingIn ) {
				this.opts
					.eq( this.optsCount - 1 )
					.css( { top : this.options.stack ? 9 : 0, left : this.options.stack ? 4 : 0, width : this.options.stack ? this.size.width - 8 : this.size.width, transform : 'none' } )
					.end()
					.eq( this.optsCount - 2 )
					.css( { top : this.options.stack ? 6 : 0, left : this.options.stack ? 2 : 0, width : this.options.stack ? this.size.width - 4 : this.size.width, transform : 'none' } )
					.end()
					.eq( this.optsCount - 3 )
					.css( { top : this.options.stack ? 3 : 0, left : 0, transform : 'none' } );
			}

		},
		_initEvents : function() {			
			var self = this;
			
			this.selectlabel.on( 'mousedown.dropdown', function( event ) {
				self.opened ? self.close() : self.open();
				return false;

			} );

			this.opts.on( 'click.dropdown', function() {
				if( self.opened ) {
					var opt = $( this );
					self.options.onOptionSelect( opt );
					self.inputEl.val( opt.data( 'value' ) );
					self.selectlabel.html( opt.html() );
					self.close();
				}
			} );

		},
		open : function() {
			var self = this;
			this.dd.toggleClass( 'cd-active' );
			this.listopts.css( 'height', ( this.optsCount + 1 ) * ( this.size.height + this.options.gutter ) );
			this.opts.each( function( i ) {

				$( this ).css( {
					opacity : 1,
					top : self.options.rotated ? self.size.height + self.options.gutter : ( i + 1 ) * ( self.size.height + self.options.gutter ),
					left : self.options.random ? Math.floor( Math.random() * 11 - 5 ) : 0,
					width : self.size.width,
					marginLeft : 0,
					transform : self.options.random ?
						'rotate(' + Math.floor( Math.random() * 11 - 5 ) + 'deg)' :
						self.options.rotated ?
							self.options.rotated === 'right' ?
								'rotate(-' + ( i * 5 ) + 'deg)' :
								'rotate(' + ( i * 5 ) + 'deg)'
							: 'none',
					transitionDelay : self.options.delay && Modernizr.csstransitions ? self.options.slidingIn ? ( i * self.options.delay ) + 'ms' : ( ( self.optsCount - 1 - i ) * self.options.delay ) + 'ms' : 0
				} );

			} );
			this.opened = true;
			self.options.onDropdownOpened( this );			
		},
		close : function() {
			var self = this;
			this.dd.toggleClass( 'cd-active' );
			if( this.options.delay && Modernizr.csstransitions ) {
				this.opts.each( function( i ) {
					$( this ).css( { 'transition-delay' : self.options.slidingIn ? ( ( self.optsCount - 1 - i ) * self.options.delay ) + 'ms' : ( i * self.options.delay ) + 'ms' } );
				} );
			}
			this._positionOpts( true );
			this.opened = false;
			self.options.onDropdownClosed( );
		},
		_sprintf : function(str) {		
			var args = arguments,
				flag = true,
				i = 1;

			str = str.replace(/%s/g, function () {
				var arg = args[i++];

				if (typeof arg === 'undefined') {
					flag = false;
					return '';
				}
				return arg;
			});
			return flag ? str : '';
		},
		_createliElement : function(classes, val, label) { 
			return classes !== undefined ? 
					this._sprintf( '<li data-value="%s"><span class="%s">%s</span></li>', val, classes, label) :
					this._sprintf( '<li data-value="%s"><span>%s</span></li>', val, label );
							
		},
		_requiredStyle : [
							'*,',
							'*:after,',
							'*:before {',
								'-webkit-box-sizing: border-box;',
								'-moz-box-sizing: border-box;',
								'box-sizing: border-box;',
								'padding: 0;',
								'margin: 0;',
							'}',
							'.cd-dropdown,',
							'.cd-select {',
								'position: relative;',
								'width: 300px;',
								'margin: 20px auto;',
								'display: block;',
							'}',
							'.cd-dropdown > span {',
								'width: 100%;',
								'height: 60px;',
								'line-height: 60px;',
								'color: #999;',
								'font-weight: 700;',
								'font-size: 16px;',
								'background: #fff;',
								'display: block;',
								'padding: 0 50px 0 30px;',
								'position: relative;',
								'cursor: pointer;',
							'}',
							'.cd-dropdown > span:after {',
								'content: "\\25BC";',
								'position: absolute;',
								'right: 0px;',
								'top: 15%;',
								'width: 50px;',
								'text-align: center;',
								'font-size: 12px;',
								'padding: 10px;',
								'height: 70%;',
								'line-height: 24px;',
								'border-left: 1px solid #ddd;',
							'}',
							'.cd-dropdown.cd-active > span:after {',
								'content: "\\25B2";',
							'}',
							'.cd-dropdown ul {',
								'list-style-type: none;',
								'margin: 0;',
								'padding: 0;',
								'display: block;',
								'position: relative;',
							'}',
							'.cd-dropdown ul li {',
								'display: block;',
							'}',
							'.cd-dropdown ul li span {',
								'width: 100%;',
								'background: #fff;',
								'line-height: 60px;',
								'padding: 0 30px 0 75px;',
								'display: block;',
								'color: #bcbcbc;',
								'cursor: pointer;',
								'font-weight: 700;',
							'}',
							'.cd-dropdown > span,',
							'.cd-dropdown ul li span {',
								'-webkit-backface-visibility: hidden;',
								'-webkit-touch-callout: none;',
								'-webkit-user-select: none;',
								'-khtml-user-select: none;',
								'-moz-user-select: none;',
								'-ms-user-select: none;',
								'user-select: none;',
							'}',
							'.cd-dropdown > span span[class^="icon-"],',
							'.cd-dropdown > span span[class*=" icon-"]{',
								'padding: 0 30px 0 45px;',
							'}',
							'.cd-select {',
								'border: 1px solid #ddd;',
							'}'].join('')

	}

	$.fn.jqDropdown = function( options ) {
		var instance = $.data( this, 'dropdown' );
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				instance[ options ].apply( instance, args );
			});
		}
		else {
			this.each(function() {
				instance ? instance._init() : instance = $.data( this, 'dropdown', new $.jqDropdown( options, this ) );
			});
		}
		return instance;
	};

} )( jQuery, window );
