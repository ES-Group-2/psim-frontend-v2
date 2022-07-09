import React, { useEffect, useState } from 'react';
import { List, Button, Loader } from 'semantic-ui-react'
import styled from 'styled-components';

const MsgErro = styled(List.Header)`
    max-width: 80%;
    float: left;
`;

const DeleteError = styled(Button)`
    max-width: 20%;
`;

function ListaErros(props) {

    const [erros, setErros] = useState([])
    const [esperando, setEsperando] = useState(false)

    useEffect(() => {

        function resolverProblemas(msgs) {

            const reqOptions = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ erros: msgs })
            }
            
            fetch(process.env.REACT_APP_BACKEND + 'questao/' + props.qid + '/erros/', reqOptions)
                .then((resp) => {
                    if (resp.ok) {
                        listarProblemas()
                    } else {
                        console.log('Algo deu errado!')
                    }
                })
                .catch((error) => {
                    console.log(error)
                })

        }

        function listarProblemas() {

            setEsperando(true)

            const reqOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('auth-token')
                }
            }

            fetch(process.env.REACT_APP_BACKEND + 'questao/' + props.qid + '/erros/', reqOptions)
                .then((resp) => {
                    if (resp.ok) {
                        return resp.json()
                    } else {
                        console.log('Algo deu errado!')
                    }
                }).then((resp) => {
                    setErros(resp.erros.map((erro, i) => {
                        return (
                            erro === "" ? <></> :
                                <List.Item key={i}>
                                    <List.Content >
                                        <MsgErro as='span' >{erro}</MsgErro>
                                        <DeleteError
                                            onClick={() => resolverProblemas([erro])}
                                            negative
                                            floated='right'
                                            icon='close'
                                            size='mini'
                                            circular
                                        />
                                    </List.Content>
                                </List.Item>
                        )
                    }))
                    setEsperando(false)
                })
                .catch((error) => {
                    console.log(error)
                })

        }

        listarProblemas()

    }, [props.qid])

    function renderList() {
        if (esperando) {
            return <Loader inline='centered' active={esperando} size='big'>Carregando</Loader>
        } else if (erros.length === 0) {
            return <span>Nenhum erro encontrado.</span>
        } else {
            return <List divided relaxed>{erros}</List>
        }
    }

    return (renderList())

}

export default ListaErros;