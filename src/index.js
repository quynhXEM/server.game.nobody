/**
 * QUAN TRỌNG:
 * ---------
 * Không chỉnh sửa file này thủ công nếu bạn muốn host server trên Colyseus Cloud
 *
 * Nếu bạn tự host (không dùng Colyseus Cloud), bạn có thể thủ công
 * khởi tạo Colyseus Server như được ghi chú ở đây:
 *
 * Xem: https://docs.colyseus.io/server/api/#constructor-options
 */
// Import hàm listen từ Colyseus tools
import { listen } from "@colyseus/tools";

// Import cấu hình ứng dụng
import app from "./app.config.js";

// Tạo và lắng nghe trên cổng 2567 (hoặc biến môi trường PORT)
listen(app);
