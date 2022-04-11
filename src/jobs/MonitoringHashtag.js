import axios from 'axios';
import twApi from '../services/TwitterAPI';
import api from '../configs/Api';

export default {
  key: 'MonitoringHashtag',
  async handle(props) {
    const { dateString, hashtag } = props.data;

    console.log(`Monitorandos Hashtag #${hashtag} - ${dateString}`);

    const { data } = await twApi.get(
      `recent?start_time=${dateString}&query=${hashtag}&expansions=author_id&user.fields=name,profile_image_url,username,verified`,
      {
        headers: {
          Authorization:
            'Bearer AAAAAAAAAAAAAAAAAAAAAFa0bAEAAAAAQmmipJxGP%2Fh99PQo%2FDxeB3P1ouU%3D8N6TkaoN8FRXaejYhfCf9fYYWagyxyoqZMR2CHjVYb4qkCc19a',
        },
      }
    );

    if (data && data.data && data.data.length > 0) {
      const tweets = data.data;
      const usets = (data.includes && data.includes.users) || [];

      const response = tweets.map(x => {
        const { name, username, profile_image_url, verified } =
          usets.find(i => i.id === x.author_id) || {};
        return { id: x.id, text: x.text, name, username, profile_image_url, verified };
      });

      await axios.post(`${api.baseURL}/monitor/tweets/receive`, { tweets: response });
    }
  },
};
