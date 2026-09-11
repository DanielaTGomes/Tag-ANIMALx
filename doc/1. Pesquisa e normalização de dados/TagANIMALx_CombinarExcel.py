import pandas as pd
import os
import glob


def juntar_excel_com_nome_ficheiro():
    """
    Junta todos os ficheiros Excel da pasta atual
    """

    # Encontrar todos os ficheiros Excel
    ficheiros = glob.glob("*.xlsx") + glob.glob("*.xls")

    if not ficheiros:
        print("❌ Nenhum ficheiro Excel encontrado na pasta!")
        return

    print(f"📁 Encontrados {len(ficheiros)} ficheiros Excel")

    lista_dataframes = []

    for ficheiro in ficheiros:
        try:
            # Extrair a primeira palavra do nome do ficheiro
            nome_sem_extensao = os.path.splitext(ficheiro)[0]
            primeira_palavra = nome_sem_extensao.split()[0]

            print(f"📊 A processar: {ficheiro}")
            print(f"   🏷️  Primeira palavra: {primeira_palavra}")

            # Determinar o engine automaticamente
            if ficheiro.endswith('.xlsx'):
                df = pd.read_excel(ficheiro, engine='openpyxl')
            else:  # .xls
                df = pd.read_excel(ficheiro, engine='xlrd')

            # Adicionar coluna no início
            df.insert(0, 'Origem_Ficheiro', primeira_palavra)

            lista_dataframes.append(df)
            print(f"   ✅ Sucesso: {len(df)} linhas")

        except Exception as e:
            print(f"   ❌ Erro: {e}")
            continue

    if not lista_dataframes:
        print("❌ Nenhum ficheiro processado com sucesso!")
        return

    # Juntar todos os dataframes
    df_final = pd.concat(lista_dataframes, ignore_index=True)

    # Guardar o ficheiro final
    nome_output = "ficheiros_combinados.xlsx"
    df_final.to_excel(nome_output, index=False, engine='openpyxl')

    print(f"\n🎉 FICHEIRO CRIADO COM SUCESSO!")
    print(f"📊 Ficheiro: {nome_output}")
    print(f"📈 Total de linhas: {len(df_final):,}")
    print(f"📋 Total de colunas: {len(df_final.columns)}")
    print(f"🗂️  Ficheiros combinados: {len(lista_dataframes)}")


# Executar
if __name__ == "__main__":
    juntar_excel_com_nome_ficheiro()