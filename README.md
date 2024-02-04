# @sequencemedia/watch-match

Watch a file system directory path and replace a _string pattern_ in its files whenever a file is added or modified

From the command line

```shell
npm start -- \
  --path '~/Documents/m3u' \
  --from '/Users/sequencemedia/Music/m4a' \
  --to '/Volumes/Audio/Assets'
```

Or with the default export

```javascript
import watchMatch from '@sequencemedia/watch-match/watch-match'

const path = '~/Documents/m3u'
const from = '/Users/sequencemedia/Music/m4a'
const to = '/Volumes/Audio/Assets'

watchMatch(path, from, to)
```

For example, You have an application generating `m3u` files. Each file is written to a directory

That directory is the `path`

```shell
cd ~/Documents/m3u
ls -l
-rw-r--r--    1 sequencemedia  staff    1879 04 Feb 08:08 The Doors - The Doors.m3u
-rw-r--r--    1 sequencemedia  staff    1879 04 Feb 08:09 The Doors - Strange Days.m3u
-rw-r--r--    1 sequencemedia  staff    1879 04 Feb 08:10 The Doors - Waiting For The Sun.m3u
```

Each file contains a _pattern_ you want to replace. In this case, the _pattern_ is also a _file system path_ `/Users/sequencemedia/Music/m4a` (but it could be _any_ string)

That is the `from`

```
#EXTM3U
#EXTINF:149,Break On Through (To The Other Side) - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/01 Break On Through (To The Other Side).m4a
#EXTINF:215,Soul Kitchen - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/02 Soul Kitchen.m4a
#EXTINF:154,The Crystal Ship - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/03 The Crystal Ship.m4a
#EXTINF:153,Twentieth Century Fox - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/04 Twentieth Century Fox.m4a
#EXTINF:200,Alabama Song (Whisky Bar) - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/05 Alabama Song (Whisky Bar).m4a
#EXTINF:428,Light My Fire - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/06 Light My Fire.m4a
#EXTINF:214,Back Door Man - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/07 Back Door Man.m4a
#EXTINF:142,I Looked At You - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/08 I Looked At You.m4a
#EXTINF:172,End Of The Night - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/09 End Of The Night.m4a
#EXTINF:137,Take It As It Comes - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/10 Take It As It Comes.m4a
#EXTINF:705,The End - The Doors
/Users/sequencemedia/Music/m4a/The Doors/The Doors/11 The End.m4a
```

And its replacement is the `to`

```
#EXTM3U
#EXTINF:149,Break On Through (To The Other Side) - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/01 Break On Through (To The Other Side).m4a
#EXTINF:215,Soul Kitchen - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/02 Soul Kitchen.m4a
#EXTINF:154,The Crystal Ship - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/03 The Crystal Ship.m4a
#EXTINF:153,Twentieth Century Fox - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/04 Twentieth Century Fox.m4a
#EXTINF:200,Alabama Song (Whisky Bar) - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/05 Alabama Song (Whisky Bar).m4a
#EXTINF:428,Light My Fire - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/06 Light My Fire.m4a
#EXTINF:214,Back Door Man - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/07 Back Door Man.m4a
#EXTINF:142,I Looked At You - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/08 I Looked At You.m4a
#EXTINF:172,End Of The Night - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/09 End Of The Night.m4a
#EXTINF:137,Take It As It Comes - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/10 Take It As It Comes.m4a
#EXTINF:705,The End - The Doors
/Volumes/Audio/Assets/The Doors/The Doors/11 The End.m4a
```
