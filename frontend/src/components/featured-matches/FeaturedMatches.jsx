import React from 'react';

import Carousel from 'react-bootstrap/Carousel';
import MatchResult from '../match-result/MatchResult';

import './FeaturedMatches.css';

const FeaturedMatches = ({ matches }) => {
    return (
        <div id='featured-matches'>
            <h2>Featured match{matches.length > 1 ? 'es' : ''}</h2>
            {
                matches.length > 1
                    ?   <Carousel>
                            {
                                matches.map(match => 
                                    <Carousel.Item key={match.id}>
                                        <MatchResult match={match} compact noTitle/>
                                    </Carousel.Item>)
                            }
                        </Carousel>
                    :   <MatchResult match={matches[0]} compact noTitle/>
            }
        </div>
    );
}

export default FeaturedMatches;

