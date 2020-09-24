CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `id_product` int NOT NULL,
  PRIMARY KEY (`id`)
)

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` int NOT NULL,
  PRIMARY KEY (`id`)
)