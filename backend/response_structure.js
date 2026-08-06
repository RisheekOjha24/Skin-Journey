// Response of API s2s/v2.0/task/skin-analysis/${taskId}
const taskData = {
  error: null,
  results: {
    output: [
      {
        ui_score: 73,
        mask_urls: [
          "https://yce-us.s3-accelerate.amazonaws.com/ttl30/486558438009079147/116441375958/v2/aeMNNB0KmUIP8rnQ996tC5Q/9023dd9c-b4ad-4016-9933-60e5ba8be4cb_texture_output.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T164940Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIARB77EV5Y5D7DAE3S%2F20260806%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=4d274df2a3d4d74360f0f563402d78554c23e3cac3cd2687090eb0b466be14a3",
        ],
        raw_score: 62.52439022064209,
        type: "texture",
        url: null,
      },
      {
        ui_score: 62,
        mask_urls: [
          "https://yce-us.s3-accelerate.amazonaws.com/ttl30/486558438009079147/116441375958/v2/aeMNNB0KmUIP8rnQ996tC5Q/9023dd9c-b4ad-4016-9933-60e5ba8be4cb_pore_output.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T164940Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIARB77EV5Y5D7DAE3S%2F20260806%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=2a505d9881298debb422e2bceb17b67648d7240174f2fbb4456b84dfb75ec79d",
        ],
        raw_score: 37.618783712387085,
        type: "pore",
        url: null,
      },
      {
        ui_score: 78,
        mask_urls: [
          "https://yce-us.s3-accelerate.amazonaws.com/ttl30/486558438009079147/116441375958/v2/aeMNNB0KmUIP8rnQ996tC5Q/9023dd9c-b4ad-4016-9933-60e5ba8be4cb_acne_output.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T164940Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIARB77EV5Y5D7DAE3S%2F20260806%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=c2f61154a4c0bd5bacf43e36d6587ce6ac97145a2744003d5395dacfd600bfb3",
        ],
        raw_score: 74.59548,
        type: "acne",
        url: null,
      },
      {
        ui_score: 53,
        mask_urls: [
          "https://yce-us.s3-accelerate.amazonaws.com/ttl30/486558438009079147/116441375958/v2/aeMNNB0KmUIP8rnQ996tC5Q/9023dd9c-b4ad-4016-9933-60e5ba8be4cb_radiance_output.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T164940Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIARB77EV5Y5D7DAE3S%2F20260806%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=4a0f51a3e29d7310b6ecfe66a47f63e7344b71fef32a37263cc593bfd1d92804",
        ],
        raw_score: 16.23941957950592,
        type: "radiance",
        url: null,
      },
      {
        ui_score: 72,
        mask_urls: [
          "https://yce-us.s3-accelerate.amazonaws.com/ttl30/486558438009079147/116441375958/v2/aeMNNB0KmUIP8rnQ996tC5Q/9023dd9c-b4ad-4016-9933-60e5ba8be4cb_moisture_output.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T164940Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIARB77EV5Y5D7DAE3S%2F20260806%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=4f741f0b9e9a171e7cdb3ae72308eeed72cd201abc3bb0aa9b1ba5a41729649d",
        ],
        raw_score: 55.152881145477295,
        type: "moisture",
        url: null,
      },
      {
        score: 67.6,
        type: "all",
        url: null,
      },
      {
        score: 27,
        type: "skin_age",
        url: null,
      },
      {
        mask_urls: [
          "https://yce-us.s3-accelerate.amazonaws.com/ttl30/486558438009079147/116441375958/v2/aeMNNB0KmUIP8rnQ996tC5Q/9023dd9c-b4ad-4016-9933-60e5ba8be4cb_resize_image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260806T164940Z&X-Amz-SignedHeaders=host&X-Amz-Expires=7200&X-Amz-Credential=AKIARB77EV5Y5D7DAE3S%2F20260806%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=324b472daf8c84de0d42c7edc31b56b757bcea9438860c302b66b1bc5aae062a",
        ],
        type: "resize_image",
        url: null,
      },
    ],
  },
  task_status: "success",
};
