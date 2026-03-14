/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import type { Node } from '@types/unist';
import { h } from 'hastscript';
import { visit } from 'unist-util-visit';

export default function remarkColors() {
	return (tree: Node) => {
		visit(tree, function (node) {
			if (
				node.type === 'containerDirective' ||
				node.type === 'leafDirective' ||
				node.type === 'textDirective'
			) {
				let color;
				switch (node.name) {
					case 'red':
						color = 'red';
						break;
					case 'green':
						color = 'green';
						break;
					case 'blue':
						color = 'blue';
						break;
					default:
						return;
				}

				const data = node.data || (node.data = {});
				const tagName = node.type === 'textDirective' ? 'span' : 'div';
				const attributes = {
					style: `color: ${color};`,
					...node.attributes,
				};

				data.hName = tagName;
				data.hProperties = h(tagName, attributes).properties;
			}
		});
	};
}
