# Deviant4rt DL

`npm run gallery {username} {page}`
- --> stores images in /gallery/username

`npm run favs {username} {page}`
- --> stores images in /favs/username

## API keys

> keys.json

E.g.

```
{
  "env": {
      "DEVIANTART_SECRET_KEY1": "0123:ae9c1b6cb4bacbbf57133dd4a041e6bf",
      "DEVIANTART_SECRET_KEY2": "3456:b5a416b183e41e8ca5b3e5e23f66660c",
      "DEVIANTART_SECRET_KEY3": "1357:c72fb16c61a72d3ace08c9c95c2f5472"
  }
}
```

## API

https://www.deviantart.com/developers/

https://www.npmjs.com/package/damn

## RSS

Eg. http://backend.deviantart.com/rss.xml?q=favby:username&type=deviation&offset=0

## DIFI

**WARNING:** Seems broken...

https://github.com/danopia/deviantart-difi/wiki

- https://www.deviantart.com/global/difi.php?c=Stream;thumbs;favby:username,0,24&t=xml
