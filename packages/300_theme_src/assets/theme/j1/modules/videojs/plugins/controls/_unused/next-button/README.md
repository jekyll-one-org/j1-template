### videojs-next-button
=================

A videojs plugin to display a next button in control bar

-----
Usage
-----
```javascript
	var video = videojs('#example', {
		'controlBar': {
			'children': [
				// other components...
				{
					'name': 'nextButton',
					'next': 'https://www.baidu.com'
				},
				// other components
			]
		}
	});
```
