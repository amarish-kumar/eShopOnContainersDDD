import { types, flow, getEnv, getParent, applySnapshot, getSnapshot } from 'mobx-state-tree';
import * as validate from 'validate.js';
import uuid from 'uuid/v4';
import Debug from 'debug';

import rules from '../validation';
import { FieldDefinition } from '../../../components/models';
import { when } from '../../../utils';

import { DTOs } from '../../../utils/eShop.dtos';
import { Data, DataModel, urlToBase64 } from '../../../utils/image';
import { ApiClientType } from '../../../stores';

import { TypeListType, TypeListModel, TypeType, TypeModel } from '../models/types';
import { BrandListType, BrandListModel, BrandType, BrandModel } from '../models/brands';

import BrandFormView from '../components/brandForm';

const debug = new Debug('product');

export interface ProductFormType {
  id: string;
  name: string;
  description: string;
  price: number;
  catalogType: TypeType;
  catalogBrand: BrandType;

  picture: Data;

  readonly form: { [idx: string]: FieldDefinition };
  submit: () => Promise<{}>;
}
export const ProductFormModel = types
  .model({
    id: types.optional(types.identifier(types.string), uuid),
    name: types.maybe(types.string),
    description: types.maybe(types.string),
    price: types.maybe(types.number),
    catalogType: types.maybe(TypeModel),
    catalogBrand: types.maybe(BrandModel),
    picture: types.maybe(DataModel)
  })
  .views(self => ({
    get validation() {
      const validation = {
        name: rules.product.name,
        price: rules.product.price,
        catalogType: rules.product.catalogType,
        catalogBrand: rules.product.catalogBrand,
        picture: rules.product.picture
      };

      return validate(self, validation);
    },

    get form(): { [idx: string]: FieldDefinition } {
      return ({
        name: {
          input: 'text',
          label: 'Name',
          required: true,
        },
        description: {
          input: 'textarea',
          label: 'Description',
        },
        price: {
          input: 'number',
          label: 'Price',
          required: true,
          normalize: 2
        },
        catalogType: {
          input: 'selecter',
          label: 'Catalog Type',
          required: true,
          selectStore: TypeListModel,
        },
        catalogBrand: {
          input: 'selecter',
          label: 'Catalog Brand',
          required: true,
          selectStore: BrandListModel,
          addComponent: BrandFormView
        },
        picture: {
          input: 'image',
          label: 'Picture',
          imageRatio: 1,
          required: true,
        },
      });
    }
  }))
  .actions(self => {
    const addProduct = () => {
      const request = new DTOs.AddProduct();

      request.productId = self.id;
      request.name = self.name;
      request.price = self.price;
      request.catalogBrandId = self.catalogBrand.id;
      request.catalogTypeId = self.catalogType.id;

      return request;
    };
    const setPicture = () => {
      const request = new DTOs.SetPictureProduct();

      request.productId = self.id;
      request.content = self.picture.data as any;
      request.contentType = self.picture.contentType;

      return request;
    };
    const setDescription = () => {
      const request = new DTOs.UpdateDescriptionProduct();

      request.productId = self.id;
      request.description = self.description;

      return request;
    };

    const submit = flow(function*() {
      const requests = [ addProduct, ...when(self.picture, setPicture), ...when(self.description, setDescription) ];

      const client = getEnv(self).api as ApiClientType;
      for (let i = 0; i < requests.length; i++) {
        try {
          const result: DTOs.CommandResponse = yield client.command(requests[i]());
        } catch (error) {
          debug('received http error: ', error);
          throw error;
        }
      }

    });

    return { submit };
  });