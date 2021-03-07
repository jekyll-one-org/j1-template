# Latest Jekyll version

The repo-based version of Jekyll can be used with your bundle like:

Gemfile


- gem "jekyll", "3.8.5"
+ gem "jekyll", github: "jekyll/jekyll"


## Jekyll 4.0 Notes

Post-install message from jekyll:

This version of Jekyll comes with some major changes.

Most notably:

* Our `link` tag now comes with the `relative_url` filter incorporated into it.
  You should no longer prepend `{{ site.baseurl }}` to `{% link foo.md %}`
  For further details: https://github.com/jekyll/jekyll/pull/6727

* Our `post_url` tag now comes with the `relative_url` filter incorporated into it.
  You shouldn't prepend `{{ site.baseurl }}` to `{% post_url 2019-03-27-hello %}`
  For further details: https://github.com/jekyll/jekyll/pull/7589

