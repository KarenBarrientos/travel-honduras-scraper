// como jalar atractivos
this.dbRefAtractivos = firebase.database().ref('/atractivos');
this.dbCallbackAtractivos = this.dbRefAtractivos.on('value', (snap) => {
    this.setState({ atractivos: snap.val() });
});
