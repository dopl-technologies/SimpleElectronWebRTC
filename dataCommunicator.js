const { Server } = require('socket.io');
const { createServer } = require('http');

module.exports = class DataCommunicator {
    constructor(port) {
        this.port = port

        this.httpServer = createServer();
        this.io = new Server(this.httpServer);
    }

    start() {
        this._setupListeners()

        this.httpServer.listen(this.port);
        console.log(`Server running on port ${this.port}`);
    }

    _setupListeners() {
        this.io.on('connection', client => {
            console.log(`Client ${client.id} connected`);
        
            var dummyTeleroboticProcedureId = 1
            client.emit("joined_telerobotic_procedure", dummyTeleroboticProcedureId)
        
            client.on('send_ultrasound_controller_data', (data) => {
                this._onUltrasoundControllerData(data)
            })

            client.on('disconnect', () => {
                /* … */
            });
        });
    }

    _onUltrasoundControllerData(data) {
        console.log(`Received ultrasound controller data: ${data}`)
        // TODO: Pipe this into the data channel
    }
}
