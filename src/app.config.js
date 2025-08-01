import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { MyRoom } from "./rooms/MyRoom.js";
import cors from "cors"; // ✅ thêm dòng này

export default config({

    initializeGameServer: (gameServer) => {
        gameServer.define('my_room', MyRoom);
    },

    initializeExpress: (app) => {
        // ✅ bật CORS ở đây
        app.use(cors({
            origin: "*", // 👉 cho phép tất cả origin (phù hợp khi test)
            // Nếu deploy thật thì dùng:
            // origin: ['https://tên-miền.vercel.app'],
            credentials: true
        }));

        app.get("/hello_world", (req, res) => {
            res.send("Đã đến lúc đá đít và nhai kẹo cao su!");
        });

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        app.use("/monitor", monitor());
    },

    beforeListen: () => {
        // chưa cần gì ở đây
    }

});
