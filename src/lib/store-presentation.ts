import drill from "@/assets/products/bor-500w.jpg";
import grinder from "@/assets/products/gerinda-4.jpg";
import welder from "@/assets/products/las-200a.jpg";
import tools from "@/assets/products/toolbox.jpg";
import screwdriver from "@/assets/products/obeng-set.jpg";
import blender from "@/assets/products/blender.jpg";
import fan from "@/assets/products/kipas.jpg";
import headphones from "@/assets/products/headset.jpg";
import lamp from "@/assets/products/lampu.jpg";
import paint from "@/assets/products/cat-tembok.jpg";
import hose from "@/assets/products/selang.jpg";
import helmet from "@/assets/products/helm.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "bor-500w": drill, "gerinda-4": grinder, "las-200a": welder,
  toolbox: tools, "obeng-set": screwdriver, blender, kipas: fan,
  headset: headphones, lampu: lamp, "cat-tembok": paint, selang: hose, helm: helmet,
};

export const CATEGORY_IMAGES: Record<string, string> = {
  perkakas: tools, listrik: drill, las: welder, rumah: blender,
  elektronik: headphones, taman: hose, cat: paint, keamanan: helmet,
};