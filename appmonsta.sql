-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 31 Bulan Mei 2020 pada 11.13
-- Versi server: 10.4.6-MariaDB
-- Versi PHP: 7.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `appmonsta`
--
CREATE DATABASE IF NOT EXISTS `appmonsta` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `appmonsta`;

-- --------------------------------------------------------

--
-- Struktur dari tabel `dislike_post`
--

DROP TABLE IF EXISTS `dislike_post`;
CREATE TABLE `dislike_post` (
  `id_dislike` int(11) NOT NULL,
  `id_post` int(11) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `history_vote`
--

DROP TABLE IF EXISTS `history_vote`;
CREATE TABLE `history_vote` (
  `email_voter` varchar(50) NOT NULL,
  `id_list_vote` int(10) NOT NULL,
  `indeks_pilihan_vote` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `history_vote`
--

INSERT INTO `history_vote` (`email_voter`, `id_list_vote`, `indeks_pilihan_vote`) VALUES
('popo.com', 18, 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `like_post`
--

DROP TABLE IF EXISTS `like_post`;
CREATE TABLE `like_post` (
  `id_like` int(11) NOT NULL,
  `id_post` int(11) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `list_vote`
--

DROP TABLE IF EXISTS `list_vote`;
CREATE TABLE `list_vote` (
  `id_list_vote` int(11) NOT NULL,
  `judul_vote` varchar(255) NOT NULL,
  `email_pembuat` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `list_vote`
--

INSERT INTO `list_vote` (`id_list_vote`, `judul_vote`, `email_pembuat`) VALUES
(17, 'Anime greatest hits', 'mike.com'),
(18, '2020 greatest hits', 'popo.com');

-- --------------------------------------------------------

--
-- Struktur dari tabel `post`
--

DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `id_post` int(11) NOT NULL,
  `email` text NOT NULL,
  `total_up` int(11) DEFAULT NULL,
  `total_down` int(11) DEFAULT NULL,
  `tgl_post` date NOT NULL,
  `judul_post` varchar(50) NOT NULL,
  `caption_post` varchar(255) DEFAULT NULL,
  `img_path` text DEFAULT NULL,
  `app_id` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `post`
--

INSERT INTO `post` (`id_post`, `email`, `total_up`, `total_down`, `tgl_post`, `judul_post`, `caption_post`, `img_path`, `app_id`) VALUES
(30, 'ming@gmail.com', 0, 0, '2020-05-31', 'Vote This Girl!', 'Youngest miss universe 2020', 'none', 'com.missuniverse.app');

-- --------------------------------------------------------

--
-- Struktur dari tabel `review_post`
--

DROP TABLE IF EXISTS `review_post`;
CREATE TABLE `review_post` (
  `id_review` int(11) NOT NULL,
  `id_post` int(11) DEFAULT NULL,
  `comment` varchar(1000) NOT NULL,
  `tgl_review` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `review_post`
--

INSERT INTO `review_post` (`id_review`, `id_post`, `comment`, `tgl_review`) VALUES
(6, 30, 'Komen3123', '2020-05-31');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `username` text NOT NULL,
  `password` text NOT NULL,
  `email` varchar(50) NOT NULL,
  `tipe_user` int(5) NOT NULL,
  `profile_picture` varchar(50) NOT NULL,
  `api_hit` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`username`, `password`, `email`, `tipe_user`, `profile_picture`, `api_hit`) VALUES
('ike', '123', 'mike.com', 1, 'default.jpg', 5),
('mik', '321', 'mike@mail.com', 1, 'mike@mail.com.jpg', 5),
('ming', 'ming123', 'ming@gmail.com', 2, '', 5),
('mitchell', 'mitchell', 'mitchell@gmail.com', 2, 'blablabla', 5),
('popo', '1234', 'popo.com', 1, 'default.jpg', 5);

-- --------------------------------------------------------

--
-- Struktur dari tabel `vote`
--

DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id_list_vote` int(5) NOT NULL,
  `indeks_pilihan_vote` int(10) NOT NULL,
  `id_app` varchar(50) NOT NULL,
  `nama_app` varchar(100) NOT NULL,
  `publisher_name` varchar(50) NOT NULL,
  `app_type` varchar(50) NOT NULL,
  `genre` varchar(50) NOT NULL,
  `Jumlah_vote` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `vote`
--

INSERT INTO `vote` (`id_list_vote`, `indeks_pilihan_vote`, `id_app`, `nama_app`, `publisher_name`, `app_type`, `genre`, `Jumlah_vote`) VALUES
(17, 1, 'com.hazelfunstudio.icecream.donut.maker', 'Ice Cream Donuts Maker: Dessert Cooking Games', 'Hazel Fun Studio', 'GAME', 'Role Playing', 0),
(17, 2, 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 0),
(18, 1, 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 0),
(18, 2, 'com.smcim.stalphonsamulapra', 'ST.ALPHONSA CHURCH,MULAPRA', 'tellicherryarchdiocese', 'APPLICATION', 'Communication', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist` (
  `email` text NOT NULL,
  `app_id` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `dislike_post`
--
ALTER TABLE `dislike_post`
  ADD PRIMARY KEY (`id_dislike`);

--
-- Indeks untuk tabel `like_post`
--
ALTER TABLE `like_post`
  ADD PRIMARY KEY (`id_like`);

--
-- Indeks untuk tabel `list_vote`
--
ALTER TABLE `list_vote`
  ADD PRIMARY KEY (`id_list_vote`);

--
-- Indeks untuk tabel `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id_post`);

--
-- Indeks untuk tabel `review_post`
--
ALTER TABLE `review_post`
  ADD PRIMARY KEY (`id_review`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `dislike_post`
--
ALTER TABLE `dislike_post`
  MODIFY `id_dislike` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `like_post`
--
ALTER TABLE `like_post`
  MODIFY `id_like` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `list_vote`
--
ALTER TABLE `list_vote`
  MODIFY `id_list_vote` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `post`
--
ALTER TABLE `post`
  MODIFY `id_post` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT untuk tabel `review_post`
--
ALTER TABLE `review_post`
  MODIFY `id_review` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
