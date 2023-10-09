import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


export default defineConfig({
	plugins: [react()], 
	css: {
		preprocessorOptions: {
			less: {
			
				additionalData: `@import "${path.resolve(__dirname,'src/assets/styles/var.module.less')}";`,  
				javascriptEnabled: true,
			}
		},
	},
	
	resolve:{
		alias:{
			"@":path.resolve(__dirname, "src"), 
			"styles": path.resolve(__dirname, "src/assets/styles"),
			"img": path.resolve(__dirname, "src/assets/img"),
			"views": path.resolve(__dirname, "src/views"),
			"utils": path.resolve(__dirname, "src/utils"),
			"apis": path.resolve(__dirname, "src/apis"),
			"components": path.resolve(__dirname, "src/components")
		}
	},
	server: {
    proxy: {
      "/api": {
        target: "http://3.24.65.119:8080/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

})
