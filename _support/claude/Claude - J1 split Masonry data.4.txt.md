Prompt
   
--------------------------------------------------------------------------------

The single YAML data file for the module Masonry has been split into two
files: masonry_player.yml and masonry_playlist.yml. The HTML (liquid) template
masonry.html is used to create the HTML portions for each masonry grid
(per ID) statically. Dynamic configurations and overwrites should be done
using the adapter (controller) masonry.js.

The default data is configured by the (Liquid) var "masonry_default" reading
from the YAML data file modules.masonry_player. Many settings in the YAML
data file modules.masonry_player.settings is usimg ID-wise different values
like the key "skipButtonsPlugin" (properties: options.forward options.backward).

All data is the same, 

Create fixed versions and use the comment
"claude - split J1 Masonry data #2" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

