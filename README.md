# Go to around HCM

Website khám phá TP. Hồ Chí Minh, phát triển bằng HTML, CSS và JavaScript thuần. Dự án được triển khai theo từng giai đoạn; dữ liệu chưa được xác minh đầy đủ được đánh dấu rõ, tọa độ không có nguồn sẽ không tạo marker và chưa dùng ảnh chưa rõ nguồn.

## Chạy trên máy cá nhân

Yêu cầu Python 3. Mở terminal tại thư mục dự án và chạy:

```powershell
python -m http.server 8000
```

Sau đó mở <http://localhost:8000/>. Cần dùng local server vì trình duyệt tải dữ liệu địa điểm bằng `fetch`; mở trực tiếp `index.html` không được hỗ trợ.

## Trạng thái hiện tại

- Giai đoạn 1: tạo schema và danh sách ban đầu 15 địa điểm/ứng viên; bổ sung thêm 8 điểm ăn uống, chợ và mua sắm có ảnh nguồn mở.
- Giai đoạn 2: hoàn thành giao diện responsive cơ bản, tìm kiếm và lọc danh mục.
- Giai đoạn 3: hoàn thành bản đồ Leaflet, marker có nguồn tọa độ, lọc marker theo kết quả, popup, định vị theo thao tác và xử lý lỗi tile.
- Giai đoạn 4: nhập địa chỉ hoặc chọn gợi ý địa điểm cho A/B; chọn xe buýt hoặc xe máy. Tuyến xe máy được tính theo mạng lưới đường qua OSRM; xe buýt là tuyến minh họa, không phải chỉ dẫn xe buýt thực tế.
- Giai đoạn 5: hoàn thành trình xem panorama 360°; chỉ hiển thị ảnh có metadata nguồn và giấy phép.
- Giai đoạn 6: hoàn thành yêu thích, lịch sử xem, đánh giá sao nhanh và review có nội dung theo từng địa điểm bằng LocalStorage trên trình duyệt hiện tại.
- Tính năng khám phá: xem chi tiết địa điểm, thông tin tham quan và nguồn dữ liệu.
- Lịch trình một ngày: chọn mục tiêu tham quan/mua sắm/ăn uống, ngân sách tối đa, giờ bắt đầu-kết thúc rảnh, điểm xuất phát, nhịp độ và phương tiện mô phỏng. Ứng dụng ưu tiên ghé đủ các mục tiêu khả thi trong giới hạn, rồi chọn thêm tối đa 4–6 điểm theo khoảng cách; điểm thay thế vượt dự trù tiền, thời gian hoặc làm thiếu mục tiêu đã chọn sẽ bị vô hiệu hóa. Khi tạo lịch trình hoặc đổi điểm dừng, tuyến đường bộ trên bản đồ tự được tính lại theo thứ tự điểm mới. Dự trù cho mỗi điểm là mức minh họa theo nhóm (ăn uống 100.000 ₫, mua sắm 150.000 ₫, chợ/khu văn hóa 80.000 ₫, nghệ thuật biểu diễn 100.000 ₫, bảo tàng/di tích 50.000 ₫, công viên 30.000 ₫; nhóm còn lại 0 ₫), cộng chi phí di chuyển ước tính. Đây không phải giá vé/giá ăn/giá mua sắm thực tế; thời lượng, giờ hoạt động và giao thông cũng chưa được xác nhận. Tuyến vẽ là đường bộ tham khảo, không phải tuyến xe buýt.
- Phần quản trị đang tạm ẩn để ưu tiên hoàn thiện các tính năng khám phá chính.

## Dữ liệu địa điểm

- `data/places.json` là dữ liệu khởi đầu; `data/places.schema.json` mô tả cấu trúc và trường bắt buộc.
- `data/busRoutes.json` chứa các tuyến ví dụ; không có mã tuyến, lịch xe hoặc giá/thời gian chính thức.
- `data/panoramas.json` và `data/panoramas.schema.json` chứa metadata panorama; chỉ panorama có `placeId` được xác minh mới mở từ chi tiết địa điểm. Panorama hiện có chưa gắn với địa điểm cụ thể.
- Mỗi địa điểm có `verificationStatus`: `candidate`, `partially-verified` hoặc `verified`.
- Review gồm số sao và nhận xét do khách tự nhập trong hộp thoại chi tiết; tên hiển thị không bắt buộc. Review được lưu trong LocalStorage nên chỉ xuất hiện trên trình duyệt/thiết bị đã gửi, chưa phải review Google và chưa đồng bộ giữa khách truy cập. Không có nội dung review mẫu được giả làm đánh giá thật.
- Trong 23 địa điểm hiện tại, các điểm mới bổ sung có tọa độ tham chiếu từ đối tượng OpenStreetMap và ảnh cục bộ có ghi tác giả, nguồn, giấy phép. Đây là dữ liệu tham khảo và chưa đồng nghĩa với việc mọi thông tin địa điểm đã được xác minh đầy đủ.
- Địa chỉ của các địa điểm có địa chỉ cụ thể được đối chiếu với trang chính thức hoặc bài viết Wikipedia và liên kết trong `sourceUrl`. Với Chợ Lớn, địa chỉ và điểm ghim là Chợ Bình Tây, chỉ dùng làm điểm tham khảo chứ không đại diện toàn khu vực. Với Địa đạo Củ Chi, điểm ghim là tọa độ tham khảo của hệ thống địa đạo, không xác định cổng Bến Dược hay Bến Đình; cần chọn cơ sở tham quan cụ thể trước khi dùng làm chỉ dẫn.
- Giờ mở cửa và vé Dinh Độc Lập, Thảo Cầm Viên Sài Gòn, Công viên Văn hóa Đầm Sen được đối chiếu với [nguồn chính thức của Dinh Độc Lập](https://dinhdoclap.gov.vn/lien-he/), [giá vé Thảo Cầm Viên](https://saigonzoo.vn/ve-tham-quan), [lịch hoạt động Thảo Cầm Viên](https://saigonzoo.vn/gia-ve-lich-hoat-dong-e20.html) và [Đầm Sen](https://damsenpark.vn/), cập nhật ngày 25/10/2026. Giờ/giá chưa được xác nhận hiển thị kèm nhãn nổi bật “Tham khảo · Chưa xác minh”; nên kiểm tra lại với đơn vị trước khi ghé/mua vé.
- Mỗi vị trí marker có liên kết `coordinateSourceUrl` tới nguồn tọa độ. Phố đi bộ Nguyễn Huệ cũng dùng điểm ghim đại diện cho cả tuyến phố. Tên, địa chỉ và thông tin hoạt động vẫn cần kiểm chứng thêm trước khi được đánh dấu xác minh đầy đủ.
- Có 23 ảnh địa điểm lưu cục bộ, mỗi ảnh có văn bản thay thế, tác giả, trang nguồn và giấy phép trong `data/places.json`. 15 ảnh đầu lấy từ Wikimedia Commons; 8 ảnh bổ sung lấy từ Flickr với giấy phép CC BY hoặc CC BY-SA. Chợ Bình Tây có một bản ghi riêng để khách tìm đúng chợ; bản ghi Khu vực Chợ Lớn vẫn dùng điểm ghim tham khảo. Giao diện tải lười và dùng khung dự phòng nếu ảnh lỗi. Trong 12 điểm mới dự kiến, hiện đã thêm 8 điểm có ảnh phù hợp; 4 điểm còn lại chưa thêm vì Wikimedia Commons đang giới hạn tải (HTTP 429) và chưa có ảnh khác phù hợp để tải cục bộ. Không gán ảnh chung hoặc ảnh chưa khớp địa điểm.

## Bản đồ

Leaflet 1.9.4 (BSD-2-Clause), nạp từ CDN, hiển thị nền tile OpenStreetMap và attribution bắt buộc. Tọa độ không có nguồn sẽ không tạo marker. Popup marker liên kết nguồn tọa độ tương ứng; dữ liệu tọa độ lấy từ các bài viết Wikipedia và được cung cấp theo [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/). Định vị chỉ bắt đầu khi người dùng bấm nút; vị trí chỉ nằm trong phiên trình duyệt và không ghi vào LocalStorage.

Tile server công cộng của OpenStreetMap có [chính sách sử dụng](https://operations.osmfoundation.org/policies/tiles/) và không phải dịch vụ không giới hạn. Với lưu lượng cao hoặc triển khai công khai, cần đánh giá chính sách tile hiện hành và chọn nhà cung cấp phù hợp; không tải tile hàng loạt hoặc dùng làm dịch vụ offline.

## Tìm địa chỉ và tuyến đường

Nhập địa chỉ xuất phát và điểm đến, hoặc chọn gợi ý địa điểm có sẵn. Địa chỉ không khớp chính xác với dữ liệu địa điểm sẽ được tra cứu bằng [Photon](https://photon.komoot.io/), dùng dữ liệu OpenStreetMap; tuyến đường bộ được tính bằng [OSRM](https://project-osrm.org/). Kết quả gồm hình học tuyến đường, khoảng cách và thời lượng ước tính, không phải dữ liệu giao thông thời gian thực hay chỉ dẫn xe buýt. Khi thay đổi lịch trình hoặc thứ tự điểm dừng, ứng dụng gửi yêu cầu tuyến mới và cập nhật đường trên bản đồ. Địa chỉ chỉ được giữ trong bộ nhớ phiên chạy để tái sử dụng truy vấn, không lưu vào LocalStorage; địa chỉ được gửi tới Photon và tọa độ được gửi tới OSRM khi tìm tuyến.

Photon và OSRM công khai được dùng không cần API key, nhưng đây là dịch vụ bên ngoài có thể giới hạn lưu lượng, thay đổi hoặc gián đoạn và không có cam kết SLA. Ứng dụng không được xem là phù hợp cho lượng truy cập cao nếu chưa triển khai nhà cung cấp hoặc máy chủ định tuyến riêng. Nếu dịch vụ không khả dụng, giao diện báo lỗi thay vì vẽ đường giả như đường thật.

## Tuyến xe buýt mô phỏng

Tùy chọn xe buýt trong bộ tìm A/B vẫn chỉ là đường nối minh họa, không bám theo đường phố, không có tuyến/điểm dừng xe buýt thật và không phải chỉ dẫn thực tế. Dữ liệu mẫu trong `data/busRoutes.json` không được dùng để khẳng định hoạt động xe buýt ngoài đời. Tuyến xe máy dùng OSRM theo mạng lưới đường tham khảo, không có thông tin giao thông thời gian thực. Tuyến bộ lịch trình cũng dùng đường bộ tham khảo và không đại diện đường chạy xe buýt.

## Panorama 360°

Mở **Khám phá panorama 360°** để kéo xoay, phóng to và xem toàn màn hình. Trình xem dùng [Pannellum 2.5.7](https://pannellum.org/) (MIT) từ jsDelivr; ảnh equirectangular hiện có là [ảnh Mapillary của `bemaps_1pd`](https://commons.wikimedia.org/wiki/File:Mapillary_(1206214506757191,_o8RhGkIP3LW9aMqBTYdnV0)_(bemaps_1pd)_2023-06-01_08H09M08S586.jpg), chụp ngày 01/06/2023 và cấp phép [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Liên kết tác giả, nguồn ảnh và giấy phép được hiển thị cạnh trình xem. Ảnh có tọa độ được Commons ghi nhận nhưng chưa được xác định là thuộc một địa điểm tham quan cụ thể; không gắn panorama này với một địa điểm trong danh sách.

Ưu tiên góc nhìn 360° đã gắn với đúng địa điểm qua `placeId`; nếu chưa có, thẻ địa điểm cung cấp liên kết mở Street View gần tọa độ trên Google Maps. Street View chỉ là ảnh gần vị trí, có thể không có ảnh hoặc không chụp đúng điểm tham quan; giao diện nêu rõ giới hạn này và không gán ảnh panorama chung cho địa điểm. Ảnh thường có nguồn và giấy phép vẫn được hiển thị riêng.

## Công nghệ và giới hạn

Không dùng framework. Leaflet và Pannellum được nạp từ CDN với SRI; dự án chưa cần trình quản lý gói. Dữ liệu địa điểm tải từ JSON tĩnh; yêu thích, lịch sử xem, đánh giá và các thay đổi quản trị cục bộ (nếu đã có) được lưu bằng LocalStorage trên trình duyệt. Chưa có backend hay tài khoản người dùng. Ảnh panorama cũng tải từ Wikimedia Commons nên cần kết nối internet.
