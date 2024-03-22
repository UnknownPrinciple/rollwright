<script setup>
import { ref } from "vue";
let count = ref(0);
if (Math.random() > 1) {
  console.log("hint");
}
</script>

<template>
  <button @click="count++">Count is: {{ count }}</button>
</template>
