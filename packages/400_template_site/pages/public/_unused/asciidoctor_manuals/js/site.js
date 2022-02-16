
! function () {
	"use strict";
	var e = document.querySelector("aside.toc.sidebar");
	if (e) {
		if (document.querySelector("body.-toc")) return e.parentNode.removeChild(e);
		var t = parseInt(e.dataset.levels || 2, 10);
		if (!(t < 0)) {
			for (var o = "article.doc", d = document.querySelector(o), n = [], i = 0; i <= t; i++) {
				var r = [o];
				if (i) {
					for (var a = 1; a <= i; a++) r.push((2 === a ? ".sectionbody>" : "") + ".sect" + a);
					r.push("h" + (i + 1) + "[id]")
				} else r.push("h1[id].sect0");
				n.push(r.join(">"))
			}
			var c, s = (m = n.join(","), f = d.parentNode, [].slice.call((f || document).querySelectorAll(m)));
			if (!s.length) return e.parentNode.removeChild(e);
			var l = {},
				u = s.reduce(function (e, t) {
					var o = document.createElement("a");
					o.textContent = t.textContent, l[o.href = "#" + t.id] = o;
					var n = document.createElement("li");
					return n.dataset.level = parseInt(t.nodeName.slice(1), 10) - 1, n.appendChild(o), e.appendChild(n), e
				}, document.createElement("ul")),
				f = e.querySelector(".toc-menu");
			f || ((f = document.createElement("div")).className = "toc-menu");
			var m = document.createElement("h3");
			m.textContent = e.dataset.title || "Contents", f.appendChild(m), f.appendChild(u);
			e = !document.getElementById("toc") && d.querySelector("h1.page ~ :not(.is-before-toc)");
			e && ((m = document.createElement("aside")).className = "toc embedded", m.appendChild(f.cloneNode(!0)), e.parentNode.insertBefore(m, e)), window.addEventListener("load", function () {
				p(), window.addEventListener("scroll", p)
			})
		}
	}

	function p() {
		var t, e = window.pageYOffset,
			o = 1.15 * v(document.documentElement, "fontSize"),
			n = d.offsetTop;
		if (e && window.innerHeight + e + 2 >= document.documentElement.scrollHeight) {
			c = Array.isArray(c) ? c : Array(c || 0);
			var i = [],
				r = s.length - 1;
			return s.forEach(function (e, t) {
				var o = "#" + e.id;
				t === r || e.getBoundingClientRect().top + v(e, "paddingTop") > n ? (i.push(o), c.indexOf(o) < 0 && l[o].classList.add("is-active")) : ~c.indexOf(o) && l[c.shift()].classList.remove("is-active")
			}), u.scrollTop = u.scrollHeight - u.offsetHeight, void(c = 1 < i.length ? i : i[0])
		}
		Array.isArray(c) && (c.forEach(function (e) {
			l[e].classList.remove("is-active")
		}), c = void 0), s.some(function (e) {
			return e.getBoundingClientRect().top + v(e, "paddingTop") - o > n || void(t = "#" + e.id)
		}), t ? t !== c && (c && l[c].classList.remove("is-active"), (e = l[t]).classList.add("is-active"), u.scrollHeight > u.offsetHeight && (u.scrollTop = Math.max(0, e.offsetTop + e.offsetHeight - u.offsetHeight)), c = t) : c && (l[c].classList.remove("is-active"), c = void 0)
	}

	function v(e, t) {
		return parseFloat(window.getComputedStyle(e)[t])
	}
}();
! function () {
	"use strict";
	var o = document.querySelector("article.doc"),
		t = document.querySelector(".toolbar");

	function i(e) {
		return e && (~e.indexOf("%") ? decodeURIComponent(e) : e).slice(1)
	}

	function c(e) {
		if (e) {
			if (e.altKey || e.ctrlKey) return;
			window.location.hash = "#" + this.id, e.preventDefault()
		}
		window.scrollTo(0, function e(t, n) {
			return o.contains(t) ? e(t.offsetParent, t.offsetTop + n) : n
		}(this, 0) - t.getBoundingClientRect().bottom)
	}
	window.addEventListener("load", function e(t) {
		var n, o;
		(n = i(window.location.hash)) && (o = document.getElementById(n)) && (document.documentElement.style.scrollBehavior = "auto", c.bind(o)(), setTimeout(c.bind(o), 0), setTimeout(function () {
			document.documentElement.style.scrollBehavior = ""
		})), window.removeEventListener("load", e)
	}), Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (e) {
		var t, n;
		(t = i(e.hash)) && (n = document.getElementById(t)) && e.addEventListener("click", c.bind(n))
	})
}();
! function () {
	"use strict";
	var t, e = document.querySelector(".page-versions .version-menu-toggle");
	e && (t = document.querySelector(".page-versions"), e.addEventListener("click", function (e) {
		t.classList.toggle("is-active"), e.stopPropagation()
	}), document.documentElement.addEventListener("click", function () {
		t.classList.remove("is-active")
	}))
}();
! function () {
	"use strict";
	var t = document.querySelector(".navbar-burger");
	t && t.addEventListener("click", function (t) {
		t.stopPropagation();
		var e = document.documentElement,
			t = document.getElementById(this.dataset.target);
		!t.classList.contains("is-active") && /mobi/i.test(window.navigator.userAgent) && (Math.round(parseFloat(window.getComputedStyle(e).minHeight)) !== window.innerHeight ? e.style.setProperty("--vh", window.innerHeight / 100 + "px") : e.style.removeProperty("--vh"));
		e.classList.toggle("is-clipped--navbar"), this.classList.toggle("is-active"), t.classList.toggle("is-active")
	}.bind(t))
}();
! function () {
	"use strict";
	var o = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm,
		l = /( ) *\\\n *|\\\n( ?) */g,
		d = / +$/gm,
		e = (document.getElementById("site-script") || {
			dataset: {}
		}).dataset,
		r = e.uiRootPath,
		p = e.svgAs,
		h = window.navigator.clipboard && null != r;
	[].slice.call(document.querySelectorAll(".doc pre.highlight, .doc .literalblock pre")).forEach(function (e) {
		var t, n, c, a, i;
		if (e.classList.contains("highlight"))(c = (t = e.querySelector("code")).dataset.lang) && "console" !== c && ((a = document.createElement("span")).className = "source-lang", a.appendChild(document.createTextNode(c)));
		else {
			if (!e.innerText.startsWith("$ ")) return;
			var s = e.parentNode.parentNode;
			s.classList.remove("literalblock"), s.classList.add("listingblock"), e.classList.add("highlightjs", "highlight"), (t = document.createElement("code")).className = "language-console hljs", t.dataset.lang = "console", t.appendChild(e.firstChild), e.appendChild(t)
		}(c = document.createElement("div")).className = "source-toolbox", a && c.appendChild(a), h && ((n = document.createElement("button")).className = "copy-button", n.setAttribute("title", "Copy to clipboard"), "svg" === p ? ((s = document.createElementNS("http://www.w3.org/2000/svg", "svg")).setAttribute("class", "copy-icon"), (a = document.createElementNS("http://www.w3.org/2000/svg", "use")).setAttribute("href", r + "/img/octicons-16.svg#icon-clippy"), s.appendChild(a), n.appendChild(s)) : ((i = document.createElement("img")).src = r + "/img/octicons-16.svg#view-clippy", i.alt = "copy icon", i.className = "copy-icon", n.appendChild(i)), (i = document.createElement("span")).className = "copy-toast", i.appendChild(document.createTextNode("Copied!")), n.appendChild(i), c.appendChild(n)), e.appendChild(c), n && n.addEventListener("click", function (e) {
			var t = e.innerText.replace(d, "");
			"console" === e.dataset.lang && t.startsWith("$ ") && (t = function (e) {
				var t, n = [];
				for (; t = o.exec(e);) n.push(t[1].replace(l, "$1$2"));
				return n.join(" && ")
			}(t));
			window.navigator.clipboard.writeText(t).then(function () {
				this.classList.add("clicked"), this.offsetHeight, this.classList.remove("clicked")
			}.bind(this), function () {})
		}.bind(n, t))
	})
}();
! function () {
	"use strict";
	var t, n, e;

	function o(e) {
		window.navigator.clipboard.writeText(e).then(function () {}, function () {})
	}
	window.navigator.clipboard && (t = /H[2-6]/, n = (document.querySelector("head meta[name=page-spec]") || {}).content, e = document.querySelector(".toolbar .edit-this-page a"), n && e && (e && e.addEventListener("click", function (e) {
		e.altKey && o(n)
	}), [].slice.call(document.querySelectorAll(".doc a.anchor")).forEach(function (e) {
		t.test(e.parentNode.tagName) && e.addEventListener("click", function (e) {
			e.altKey && (e.preventDefault(), o(n + function (e) {
				return ~e.indexOf("%") ? decodeURIComponent(e) : e
			}(this.hash)))
		}.bind(e))
	})))
}();
