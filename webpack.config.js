const path = require('path');
const fs = require('fs');
const WebpackAutoInject = require('webpack-auto-inject-version');
const DashboardPlugin = require("webpack-dashboard/plugin");
const webpack = require('webpack');

const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	output: {
		filename: 'pr0linker.js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: [
			".ts",
			".js"
		],
		modules: [
			"./node_modules",
			"./node_modules"
		],
		symlinks: true
	},
	performance: {
		hints: false
	},
	plugins: [
		new DashboardPlugin(),
		new CleanWebpackPlugin(),
		new WebpackAutoInject({
			NAME: 'pr0linker',
			SHORT: 'linker',
			SILENT: true,
			PACKAGE_JSON_PATH: './package.json',
			components: {
				AutoIncreaseVersion: true,
				InjectByTag: true
			},
			componentsOptions: {
				InjectAsComment: {
					tag: fs.readFileSync(
						path.resolve(__dirname, 'src/assets/tampermonkeyHeader.txt'), 'utf8'
					) + '\n' + fs.readFileSync(path.resolve(__dirname, 'LICENSE'), 'utf8'),
					dateFormat: 'dddd, mmmm dS, yyyy, h:MM:ss TT'
				},
				AutoIncreaseVersion: {
					runInWatchMode: false
				},
				InjectByTag: {
					fileRegex: /\.+/,
					dateFormat: 'h:MM:ss TT'
				}
			}
		})
	],
	module: {
		rules: [{
				test: /\.ts$/,
				enforce: 'pre',
				use: [{
					loader: 'eslint-loader',
					options: {
						failOnWarning: true,
						fix: true
					}
				}]
			},
			{
				test: /\.(html|svg)$/,
				use: [{
					loader: 'html-loader',
					options: {
						minimize: true,
						removeComments: true,
						collapseWhitespace: true
					}
				}]
			},
			{
				test: /\.(scss|css)$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.ts$/,
				use: ['babel-loader', 'ts-loader'],
				exclude: /node_modules/,
			}
		]
	}
};