import React, { useState } from 'react';
import { InlineTex } from 'react-tex';
import { Label, Modal, Image, List, Button, Popup, Input } from 'semantic-ui-react'
import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';
import ListaErros from './ListaErros';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Comentario from './Comentario'

const Enunciado = styled(Modal.Content)`
	text-align: justify !important;
	font-size: 1.1rem !important;
	max-height: calc(35vh) !important;
`;

const Alternativa = styled(List.Item)`
	color: black !important;
	cursor: default !important;
	margin: 2px 2px;
	height: fit-content;
`;

const Resposta = styled(Alternativa)`
	font-weight: bold !important;
	background-color: rgb(111, 221, 111) !important;
`;

function Questao({ questao }) {
	const [stateResp, setResposta] = useState("");
	const [bugText, setBugText] = useState("")
	const navigate = useNavigate()
	const univel = parseInt(localStorage.getItem('access-level')) || 0

	function getEnunciado() {

		return (
			questao.enunciado.map((enun, ind_e) =>
				<p key={ind_e}><InlineTex texContent={enun} /></p>
			)
		)

	}

	function getImagensEnunciado() {
		return (
			questao.imagens.enunciado.map((imgs, ind) =>
				<Image wrapped size='large' src={"https://raw.githubusercontent.com/ES-Group-2/questoes_poscomp/main/" + imgs + ".png"} key={ind}></Image>
			)
		)
	}

	function getAlternativas() {

		const letras = ['A. ', 'B. ', 'C. ', 'D. ', 'E. ']

		return (
			<List selection size='large'>
				{questao.alternativas.map(
					(resp, ind) => {
						return ind === questao.resposta && stateResp ?
						<Resposta key={ind}>
							<List.Content>
								<span><b>{letras[ind]}</b></span>
								<InlineTex texContent={resp} />
							</List.Content>
						</Resposta> :
						<Alternativa key={ind}>
							<List.Content>
								<span><b>{letras[ind]}</b></span>
								<InlineTex texContent={resp} />
							</List.Content>
						</Alternativa>
					}
				)}
			</List>
		)
	}

	function reportarProblema() {
		const reqOptions = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id_questao: questao.id, mensagem_erro: bugText })
		}

		setBugText("")

		fetch(process.env.REACT_APP_BACKEND + 'questao/', reqOptions)
			.then((resp) => {
				if (resp.ok) {
					toast({
						title: 'Erro reportado com sucesso!',
						icon: 'check',
						color: 'green',
						description: <p>Nossos moderadores tratar??o do erro assim que poss??vel.</p>
					})
				}
			}).catch((error) => {
				console.log(error)
			})
	}

	function editarQuestao() {
		navigate('/questoes/editar', {state: questao})
	}

	return (
		<>
			<SemanticToastContainer position="top-right" />
			<Modal.Header>
				<Label.Group size='large'>
					<Label>Ano: {questao.ano}</Label>
					<Label>Quest??o: {questao.numero}</Label>
					<Label>??rea: {questao.area}</Label>
					<Label>Sub??rea: {questao.subarea || 'n??o informada'}</Label>
				</Label.Group>
			</Modal.Header>
			<Enunciado scrolling>
				{getEnunciado()}
				{getImagensEnunciado()}
			</Enunciado>
			<Modal.Content>
				{getAlternativas()}
			</Modal.Content>
			<Modal.Actions>
				{
					univel > 0 ?
						<Button
							content="Editar"
							labelPosition='left'
							icon='edit'
							onClick={() => editarQuestao()}
							color='yellow'
						/> :
						<></>
				}
				{
					univel === 0 ?
						<Popup
							hideOnScroll
							trigger={
								<Button
									content="Reportar erro"
									labelPosition='left'
									icon='bug'
									color='orange'
								/>
							}
							content={
								<>
									<Input placeholder='Escreva aqui o erro...' action={{
										color: 'orange',
										labelPosition: 'right',
										content: 'Reportar',
										icon: 'send',
										disabled: bugText === "",
										onClick: () => reportarProblema()
									}} onChange={(e) => setBugText(e.target.value)} value={bugText} list='erros-comuns' />
									<datalist id='erros-comuns'>
										<option value='Enunciado ou alternativas est??o incorretos.' />
										<option value='Resposta est?? incorreta.' />
										<option value='LATEX n??o est?? renderizando corretamente.' />
										<option value='Imagem n??o est?? renderizando corretamente.' />
									</datalist>
								</>
							}
							on='click'
						/> :
						<></>
				}

				{
					univel > 0 ?
						<Popup
							hideOnScroll
							trigger={
								<Button
									content="Listar erros"
									labelPosition='left'
									icon='bug'
									color='orange'
								/>
							}
							content={<ListaErros qid={questao.id} />}
							on='click'
						/> :
						<></>
				}

				<Popup
					closeOnDocumentClick={false}
					trigger={
						<Button
							content="Mostrar coment??rios"
							labelPosition='left'
							icon='chat'
							color='teal'
						/>
					}
					content={
						<Comentario qid={questao.id}/>
					}
					on='click'
				/>

				<Button
					content={stateResp ? "Ocultar resposta" : "Mostrar resposta"}
					labelPosition='left'
					icon={stateResp ? 'close' : 'checkmark'}
					onClick={() => (stateResp === "" ? setResposta("resposta") : setResposta(""))}
					color={stateResp ? 'red' : 'green'}
				/>

			</Modal.Actions>
		</>
	)
}

export default Questao;