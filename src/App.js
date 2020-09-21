import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Container from '@material-ui/core/Container';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { Button, Card, CardContent, List, ListItem, ListItemText, Paper } from '@material-ui/core';
import _ from 'lodash';

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const Spoiler = styled.p`
    color: transparent;
    background-color: white;

    &:hover {
        color: white;
        background-color: transparent;
    }
`;

const difficulties = [
    {
        id: 'any',
        name: 'Any Difficulty',
    },
    {
        id: 'easy',
        name: 'Easy',
    },
    {
        id: 'medium',
        name: 'Medium',
    },
    {
        id: 'hard',
        name: 'Hard',
    },
];

const InnerContainer = styled.div`
    display: flex;

    flex-direction: column;

    width: 500px;

    & > * {
        margin-bottom: 1em;
    }
`;

const optNames = ['A', 'B', 'C', 'D'];

const generateMenuItems = (items) => {
    return items.map((item) => {
        return (
            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
        );
    });
};

function decodeRec(obj) {
    _.forEach(obj, (value, key) => {
        if (_.isString(value)) {
            obj[key] = atob(value);
        }
        else if (_.isObject(value) || _.isArray(value)) {
            obj[key] = decodeRec(value);
        }
    });

    return obj;
}

function App() {
    const [categories, setCategories] = useState([]);
    const [selectedId, setSelectedId] = useState('any');
    const [selectedDiff, setSelectedDiff] = useState('any');
    const [questions, setQuestions] = useState([]);
    // const [sessionToken, setSessionToken] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetch('https://opentdb.com/api_category.php');

            const jsonResult = await result.json();
            console.log(jsonResult);

            setCategories(jsonResult.trivia_categories);
        };

        fetchData();
    }, []);

    const fetchQuestion = async () => {
        const difficulty = selectedDiff === 'any' ? '' : `&difficulty=${selectedDiff}`;
        const cat = selectedId === 'any' ? '' : `&category=${selectedId}`;

        const url = `https://opentdb.com/api.php?amount=1&type=multiple&encode=base64${cat}${difficulty}`
        const result = await fetch(url);

        let jsonResult = await result.json();

        jsonResult = decodeRec(jsonResult);

        console.log(jsonResult);

        const newQs = jsonResult.results.map((question) => {
            let qOpts = [question.correct_answer].concat(question.incorrect_answers);

            console.log(qOpts);

            qOpts = shuffle(qOpts);

            const newQ = {
                ...question,
                opts: qOpts,
            };

            return {
                url,
                question: newQ,
            };
        });

        setQuestions(questions.concat(newQs));
    };

    const anyCat = [{
        id: 'any',
        name: 'Any Category',
    }];
    const categoryMenuItems = generateMenuItems(anyCat.concat(categories));
    const difficultyMenuItems = generateMenuItems(difficulties);

    const renderCategories = () => (
        <React.Fragment>
            <InputLabel id="cats">Category</InputLabel>
            <Select labelId="cats" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {categoryMenuItems}
            </Select>
        </React.Fragment>
    );

    const renderedQuestions = [...questions].reverse().map(({question, url}, i) => {
        console.log(question);
        return (
            <Card key={i}>
                <CardContent>
                    <Typography variant="h4" component="h4">
                        {question.category}
                    </Typography>
                    <Typography variant="subtitle1" component="h2">
                        Difficulty: {difficulties.find((diff) => diff.id === question.difficulty).name}
                    </Typography>
                    <Typography variant="body1" component="p">
                        {_.unescape(question.question)}
                    </Typography>
                    <Paper elevation={1}>
                        <List>
                            {question.opts.map((opt, optI) => {
                                return (
                                    <ListItem key={optI} button>
                                        <ListItemText>
                                            {optNames[optI]}{'). '}
                                            {_.unescape(opt)}
                                        </ListItemText>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                        <Spoiler>{question.correct_answer}</Spoiler>
                </CardContent>
            </Card>
        );
    });

    return (
        <Container fixed>
            {categories.length > 0 ? (
                <InnerContainer>
                    <InputLabel id="diff">Diffuculty</InputLabel>
                    <Select labelId="diff" value={selectedDiff} onChange={(event) => setSelectedDiff(event.target.value)}>
                        {difficultyMenuItems}
                    </Select>
                    {renderCategories()}
                    <Button onClick={() => {
                        fetchQuestion();
                    }}
                    >
                        Get Question
                    </Button>
                    {renderedQuestions}
                </InnerContainer>
            ): null}
        </Container>
  );
}

export default App;
