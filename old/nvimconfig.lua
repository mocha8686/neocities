local function devServer()
	local toggleterm = require("toggleterm")
	toggleterm.exec("pnpm dev", 2)
	toggleterm.toggle(2)
	toggleterm.toggle(1)
end

vim.keymap.set("n", "<leader>td", devServer, { noremap = true, silent = true, desc = "Start dev server" })
