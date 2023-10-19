const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerzerWebpackPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
console.log(isDev);

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new CssMinimizerWebpackPlugin(),
            new TerzerWebpackPlugin()
        ]
    }
    return config;
};

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

module.exports = {
    context: path.resolve(__dirname, 'src/'),
    entry: {
        main: './index.js',
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist/'),
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
            '@styles': path.resolve(__dirname, 'src', 'styles/'),
            '@img': path.resolve(__dirname, 'src', 'img/'),
            '@modules': path.resolve(__dirname, 'src', 'modules/'),
            '@data': path.resolve(__dirname, 'src', 'data/'),
        }
    },
    optimization: optimization(),
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'src/')
        },
        compress: true,
        port: 4200,
        hot: isDev,
        open:
        {
            app:
            {
                // name: 'chrome'
                name: 'firefox'
            }
        }
    },
    devtool: isDev ? 'source-map' : undefined,
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd,
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/img'),
                    to: path.resolve(__dirname, 'dist/img')
                },
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        }),
        new ESLintPlugin(),
    ],
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
            },
                'css-loader'
            ]
        },
        {
            test: /\.(png|jpg|svg|gif|ttf|woff|woff2|eot)$/,
            type: 'asset/resource'
        },
        {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: path.resolve(__dirname, "node_modules/"),
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            targets: {
                                edge: "17",
                                firefox: "60",
                                chrome: "67",
                                safari: "11.1",
                            },
                        }]
                    ]
                }
            }
        }],
    },
}
