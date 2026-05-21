
from dataclasses import dataclass
from flask import Flask, render_template, request, flash, redirect
import logging

app = Flask(__name__)
app.secret_key = "chave-secreta-40k"

# configure basic logging to console
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

convocados = []

@dataclass
class Convocado:
    codigo: str
    unidade: str
    faccao: str
    poder: int


@app.route("/", methods=["GET", "POST"])
def inicio():
    if request.method == "POST":
        codigo = request.form.get("codigo", "").strip()
        unidade = request.form.get("unidade", "").strip()
        faccao = request.form.get("faccao", "Imperium")
        poder_text = request.form.get("poder", "0").strip()

        if not codigo or not unidade or not poder_text:
            flash("Todos os campos devem ser preenchidos antes da convocação.", "erro")
            return redirect("/")

        if not poder_text.isdigit() or int(poder_text) < 0:
            flash("O poder deve ser um número inteiro positivo.", "erro")
            return redirect("/")

        novo = Convocado(
            codigo=codigo,
            unidade=unidade,
            faccao=faccao,
            poder=int(poder_text),
        )

        convocados.append(novo)
        # Log to terminal for visibility
        logging.info("Novo convocado registrado: código=%s | unidade=%s | facção=%s | poder=%s",
                 novo.codigo, novo.unidade, novo.faccao, novo.poder)
        print(f"Novo convocado -> código={novo.codigo}, unidade={novo.unidade}, facção={novo.faccao}, poder={novo.poder}")

        flash(f"Unidade '{unidade}' convocada com sucesso!", "sucesso")
        return redirect("/")

    busca = request.args.get("buscar", "").strip()
    if busca:
        termo = busca.casefold()
        convocados_exibidos = [
            c for c in convocados
            if termo in c.codigo.casefold()
            or termo in c.unidade.casefold()
            or termo in c.faccao.casefold()
        ]
    else:
        convocados_exibidos = convocados

    return render_template(
        "index.html",
        convocados=convocados_exibidos,
        total_convocados=len(convocados),
        busca=busca,
    )


if __name__ == "__main__":
    app.run(debug=True)
