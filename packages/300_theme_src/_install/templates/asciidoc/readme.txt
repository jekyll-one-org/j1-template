Customizing the Generated HTML

You can use templates to customize the HTML output that Asciidoctor generates 
for your site. Template files can be composed in any templating language that 
is supported by {uri-tilt}[Tilt]. Each template file corresponds to a node in 
the AsciiDoc document tree (aka AST).

Add Required Gems

  gem 'slim', '~> 3.0.7'
  gem 'thread_safe', '~> 0.3.5'
  
Asciidoctor Templates Folder

The default location of Asciidoctor (SLIM) teplates for J Template is
"_template". See all attributes for the Asciidoctor plugin with the
site config file "_config.yml".


Asciidoctor Extensions

Currently NO extensions are used for J1 Theme.


