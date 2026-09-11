import os
import glob
from iiif.static import IIIFStatic
from PIL import Image, ImageOps


# 1. REMOVER O LIMITE DE TAMANHO 
Image.MAX_IMAGE_PIXELS = None

print(" A iniciar a Linha de Montagem IIIF Profissional...")

if not os.path.exists('./resultado'):
    os.makedirs('./resultado')

# Pasta de resultados (associado à conta github)
url_github = 'https://DanielaTGomes.github.io/imagens_omeka/resultado/'

gerador = IIIFStatic(dst='./resultado', prefix=url_github)

# Procura todas as tipologias de imagem
extensoes = ['*.jpg', '*.JPG', '*.jpeg', '*.JPEG', '*.tif', '*.TIF', '*.tiff', '*.TIFF']
imagens = []
for ext in extensoes:
    imagens.extend(glob.glob(ext))

if len(imagens) == 0:
    print(" Não encontrei imagens correspondentes")
else:
    print(f" Total de imagens para processar: {len(imagens)}")

    for imagem in imagens:
        print(f"--- A processar: {imagem} ---")

        # 2. TRATAMENTO DE TRANSPARÊNCIA (Resolve o erro RGBA/JPEG)
        with Image.open(imagem) as img:
            if img.mode in ("RGBA", "P"):
                print(f"  🎨 Detetada transparência em {imagem}. A converter para fundo branco...")
                # Criamos um fundo branco do tamanho da imagem
                fundo_branco = Image.new("RGB", img.size, (255, 255, 255))
                # Colamos a imagem por cima (se for RGBA, usa o canal alpha como máscara)
                mask = img.split()[3] if img.mode == "RGBA" else None
                fundo_branco.paste(img, mask=mask)
                # Guardamos por cima da original (ou numa temporária) para o gerador aceitar
                fundo_branco.save(imagem)

        with Image.open(imagem) as img:
            precisa_guardar = False

            # Verifica silenciosamente se existe indicação de rotação (EXIF)
            exif = img.getexif()
            orientacao = exif.get(0x0112)

            if orientacao and orientacao != 1:
                print(f"  🔄 Rotação detetada em {imagem}. A endireitar...")
                img = ImageOps.exif_transpose(img)
                precisa_guardar = True

            # Verifica a transparência
            if img.mode in ("RGBA", "P"):
                print(f"  🎨 Transparência detetada em {imagem}. A colocar fundo branco...")
                fundo_branco = Image.new("RGB", img.size, (255, 255, 255))
                mask = img.split()[3] if img.mode == "RGBA" else None
                fundo_branco.paste(img, mask=mask)
                img = fundo_branco
                precisa_guardar = True

            # SÓ guarda o ficheiro pesado se fizemos alguma das alterações acima!
            if precisa_guardar:
                print("  💾 A guardar alterações na imagem original (isto pode demorar um pouco)...")
                img.save(imagem)

        # 3. GERAR IIIF
        try:
            gerador.generate(imagem)
            print(f"  ✅ Concluído!")
        except Exception as e:
            print(f"  ❌ Erro ao processar {imagem}: {e}")

    print("\n SUCESSO! Todas as imagens estão prontas.")