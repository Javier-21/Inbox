Vue.component('mail-list',{
  props: ['inbox'],
  methods:{
    actualizar: function(){
      this.$emit('refresh');
    },
    visualizarCorreo: function(indice){
      this.$emit('verCorreo',indice);
    },
    escribirCorreo: function(){
      this.$emit('compose');
    }
  },
  template: `<div>
    <button v-on:click="escribirCorreo" id="botonComponer">Compose</button>
    <h3>Inbox</h3>
    <ul v-for="(mail,index) in inbox">
      <li v-on:click="visualizarCorreo(index)">{{mail.from}}: :{{mail.subject}}</li>
    </ul>
    <button v-on:click="actualizar">Refresh</button>
  </div>`,
});

Vue.component('mail-reader',{
  props:['correo'],
  methods:{
    forward:function(){
      this.$emit('forward',this.correo);
    },
    reply:function(){
      this.$emit('reply',this.correo);
    },
    eliminar:function(id){
      this.$emit('delete',id);
    },
  },
  template:`<div class="divLila">
    <table>
      <tr>
        <td><b>From: &nbsp;</b></td><td>{{correo.from}}</td>
      </tr>
      <tr>
        <td><b>To: &nbsp;</b></td><td>{{correo.to}}</td>
      </tr>
      <tr>
        <td><b>Subject: &nbsp;</b></td><td>{{correo.subject}}</td>
      </tr>
      <tr>
        <td><b>Body: &nbsp;</b></td><td>{{correo.body}}</td>
      </tr>
    </table>
    <button v-on:click="forward">Forward</button>
    <button v-on:click="reply">Reply</button>
    <button v-on:click="eliminar(correo.id)">Delete</button>
  </div>`,
});

Vue.component('mail-composer',{
  data:function(){
    return{
      mail:{
        to: null,
        subject: null,
        body: null,
      },
    };
  },
  props:['agenda'],
  methods:{
    enviarMail: function(){
      this.$emit('enviarCorreo',this.mail);
    },
    mostrarDirecciones: function(){
      this.$emit('showAddressBook');
    }
  },
  template:`<div class="divLila">
    <table>
      <tr>
        <td><b>To: &nbsp;</b></td><td><input-address v-model="mail.to" v-bind:direcciones="agenda"></input-address></td>
      </tr>
      <tr>
        <td><b>Subject: &nbsp;</b></td><td><input type="text" v-model="mail.subject"></td>
      </tr>
      <tr>
        <td><b>Body: &nbsp;</b></td><td><textarea v-model="mail.body" rows="6" cols="40"></textarea></td>
      </tr>
    </table>
    <button v-on:click="enviarMail"> Send</button>
  </div>`
});

Vue.component('mail-forwarder',{
  data:function(){
    return{
      reenvio:{
        from: null,
        to: null,
        subject: null,
        body: null,
      },
    };
  },
  props:['agenda','correo'],
  created: function(){
    this.reenvio.from = this.correo.to;
    this.reenvio.subject = "Fw: " + this.correo.subject;
    this.reenvio.body = this.correo.body;
  },
  methods:{
    reenviar: function(){
      this.$emit('reenviarCorreo',this.reenvio);
    },
  },
  template:`<div class="divLila">
    <table>
      <tr>
        <td><b>From: &nbsp;</b></td><td><input type="text" v-model="reenvio.from" readonly></td>
      </tr>
      <tr>
        <td><b>To: &nbsp;</b></td><td><input-address v-model="reenvio.to" v-bind:direcciones="agenda"></input-address></td>
      </tr>
      <tr>
        <td><b>Subject: &nbsp;</b></td><td><input type="text" v-model="reenvio.subject"></td>
      </tr>
      <tr>
        <td><b>Body: &nbsp;</b></td><td><textarea v-model="reenvio.body" rows="6" cols="40"></textarea></td>
      </tr>
    </table>
    <button v-on:click="reenviar"> Send</button>
  </div>`
});

Vue.component('mail-replayer',{
  data:function(){
    return{
      respuesta:{
        from: null,
        to: null,
        subject: null,
        body: null,
      },
    };
  },
  props:['correo'],
  created: function(){
    this.respuesta.from = this.correo.to;
    this.respuesta.to = this.correo.from;
    this.respuesta.subject = "Re: " + this.correo.subject;
    this.respuesta.body = this.correo.body;
  },
  methods:{
    enviarRespuesta: function(){
      this.$emit('responderCorreo',this.respuesta);
    },
  },
  template:`<div class="divLila">
    <table>
      <tr>
        <td><b>From: &nbsp;</b></td><td><input type="text" v-model="respuesta.from" readonly></td>
      </tr>
      <tr>
        <td><b>To: &nbsp;</b></td><td><input type="text" v-model="respuesta.to"></td>
      </tr>
      <tr>
        <td><b>Subject: &nbsp;</b></td><td><input type="text" v-model="respuesta.subject"></td>
      </tr>
      <tr>
        <td><b>Body: &nbsp;</b></td><td><textarea v-model="respuesta.body" rows="6" cols="40"></textarea></td>
      </tr>
    </table>
    <button v-on:click="enviarRespuesta"> Send</button>
  </div>`,
});

Vue.component('input-address',{
  data: function(){
    return{
      visible: false,
      direccion: null,
    };
  },
  methods:{
    escoger: function(address){
      this.direccion = address;
      this.visible = false;
    }
  },
  watch:{
    direccion: function(){
      this.$emit('input',this.direccion);
    }
  },
  created:function(){
    this.direccion = this.value;
  },
  props:['value','direcciones'],
  template:`<div>
    <input type="text" v-model="direccion"><button id="adressBook" v-on:click="visible = true"> Adress Book</button>
    <ul v-for="direccion in direcciones" v-if="visible">
      <li v-on:click="escoger(direccion)">{{direccion}}</li>
    </ul>
  </div>`
});

//Creating the Vue object.
let options = {
  el: "#app",

  data: {
    displayComponents:{
      mailReader: false,
      mailComposer: false,
      mailForwarder: false,
      mailReplayer: false,
      inputAddress: false,
    },
    pollingId: null,
    bandeja: null,
    addressBook: null,
    correoVisualizado: null,
    correoResponder: null,
    correoReenviar: null,
  },

  created: function() {

    this.refreshMailList();
    this.initAddressBook();
    this.pollingID = setInterval(this.refreshMailList,10000);

  },

  beforeDestroy: function() {
    clearInterval(this.pollingID);
  },

  methods: {
    sendMail: function(mail){
      fetch('/composedMail',{
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mail),
      }).catch(err=> {
        console.log("Error: ",err);
      });
      this.resetDisplayMailOption();

    }, // end sendMail

    deleteMail: function(id){
      this.resetDisplayMailOption();
      fetch('/deleteMail/'+id,{
        method: 'DELETE',
      }).catch(err=> {
        console.log("Error: ",err);
      });
      this.refreshMailList();
    },

    resetDisplayMailOption: function() {
      let keys = Object.keys(this.displayComponents);
      for(let i=0;i<keys.length;i++){
        this.displayComponents[keys[i]] = false;
      }
    },

    refreshMailList: function(){
      fetch('/inbox').then(response => response.json()).then(aJson => {
        this.bandeja = aJson;
      }).catch(err =>{
        console.log('Error: ', err);
      });
    },

    initAddressBook: function(){
      fetch('/addressBook').then(response => response.json()).then(aJson => {
        this.addressBook = aJson;
      }).catch(err =>{
        console.log('Error: ', err);
      });
    }, //end initAddressBook

    displayMailReader: function(indice){
      this.resetDisplayMailOption();
      this.displayComponents.mailReader = true;
      this.correoVisualizado = this.bandeja[indice];
    },  //end displayMailReader

    displayMailComposer: function(){
      this.resetDisplayMailOption();
      this.displayComponents.mailComposer = true;
    },  //end displayMailComposer

    displayMailForwarder: function(correo){
      this.displayComponents.mailReader = false;
      this.displayComponents.mailForwarder = true;
      this.correoReenviar = correo;

    },  //end displayMailComposer

    displayMailReplyer: function(correo){
      this.displayComponents.mailReader = false;
      this.displayComponents.mailReplayer = true;
      this.correoResponder = correo;
    },  //end displayMailComposer

  }, //end methods

  template:`<div>
      <mail-list v-bind:inbox="bandeja" v-on:refresh="refreshMailList" v-on:verCorreo="displayMailReader($event)" v-on:compose="displayMailComposer"></mail-list>
      <mail-reader v-if="displayComponents.mailReader" v-bind:correo="correoVisualizado" v-on:forward="displayMailForwarder" v-on:reply="displayMailReplyer($event)" v-on:delete="deleteMail($event)"></mail-reader>
      <mail-composer v-if="displayComponents.mailComposer" v-on:enviarCorreo="sendMail($event)" v-on:showAddressBook="displayComponents.inputAddress = true" v-bind:agenda="addressBook"></mail-composer>
      <mail-forwarder v-if="displayComponents.mailForwarder" v-bind:correo="correoReenviar" v-on:reenviarCorreo="sendMail($event)" v-bind:agenda="addressBook"></mail-forwarder>
      <mail-replayer v-if="displayComponents.mailReplayer" v-bind:correo="correoResponder" v-on:responderCorreo="sendMail($event)"></mail-replayer>
    </div>`
}; //end options
new Vue(options);
