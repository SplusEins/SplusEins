<template>
  <v-container
    fluid
    fill-height>
    <v-layout
      row
      align-center
      justify-center>
      <div class="background-div">
        <img 
          src="../assets/img/calendarLogo.png"
          class="background-image">
      </div>
      <v-flex
        class="text-xs-center"
        xs12>
        <v-icon>settings</v-icon>
        <p>Leer. Wähle einen Plan aus dem Menü aus.</p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'IndexPage',
};
</script>

<style scoped lang="scss">

.background-div{
  position: absolute;
  opacity: 0.2; 
  filter: alpha(opacity=20);
}

.background-image{
  max-height: 80vh;
  max-width: 80%;
  height: auto;
	margin-left: auto;
	margin-right: auto;
	display: block;
}
</style>

