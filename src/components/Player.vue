<script setup>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
import {onMounted} from "vue";

const audio = [{
  name: "China-Y",//歌名
  artist: '徐梦圆',//歌手
  url: 'http://music.163.com/song/media/outer/url?id=536962108.mp3',//音频文件地址
  cover: 'http://imge.kugou.com/stdmusic/150/20170815/20170815070007812976.jpg',//音乐封面地址
  lrc: ""// 歌词
}]

function addMyAudio() {
  const ap = new APlayer({
    container: document.getElementById("aplayer"),
    audio: audio,
    fixed: true,
  })
}

onMounted(() => {
  addMyAudio()
})

</script>

<template>
  <div id="aplayer"></div>
</template>

<style scoped>
</style>