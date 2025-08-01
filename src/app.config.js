// Import cấu hình từ Colyseus tools
import config from "@colyseus/tools";
// Import monitor để theo dõi server
import { monitor } from "@colyseus/monitor";
// Import playground để test API
import { playground } from "@colyseus/playground";

/**
 * Import các file Room của bạn
 */
import { MyRoom } from "./rooms/MyRoom.js";

// Export cấu hình mặc định
export default config({

    // Khởi tạo game server
    initializeGameServer: (gameServer) => {
        /**
         * Định nghĩa các room handlers:
         */
        gameServer.define('my_room', MyRoom); // Đăng ký room "my_room" với class MyRoom
    },

    // Khởi tạo Express app
    initializeExpress: (app) => {
        /**
         * Bind các route Express tùy chỉnh ở đây:
         * Đọc thêm: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("Đã đến lúc đá đít và nhai kẹo cao su!");
        });

        /**
         * Sử dụng @colyseus/playground
         * (Không nên expose route này trong môi trường production)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        /**
         * Bind @colyseus/monitor
         * Nên bảo vệ route này bằng mật khẩu.
         * Đọc thêm: https://docs.colyseus.io/colyseus/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", monitor());
    },

    // Hàm được gọi trước khi server bắt đầu lắng nghe
    beforeListen: () => {
        /**
         * Trước khi gameServer.listen() được gọi.
         */
    }

});
